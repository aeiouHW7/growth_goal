#!/usr/bin/env python3
"""
增量更新 init SQL 脚本中受影响的表。
从本地 MySQL 容器导出指定表的最新 DDL，替换 init 脚本中对应的 CREATE TABLE 块。

用法:
    python3 sync_init_sql.py <table1> [table2 ...] [--init-file path] [--container name]

示例:
    python3 sync_init_sql.py backflush_order backflush_order_line
    python3 sync_init_sql.py inventory_unit --init-file wms-agent/local-dev/init-sql/WMS_INIT.sql
"""

import argparse
import re
import subprocess
import sys


def get_table_ddl(container, db_user, db_pass, db_name, table_name):
    """从 MySQL 容器导出单表 DDL"""
    cmd = [
        "docker", "exec", container, "mysqldump",
        f"-u{db_user}", f"-p{db_pass}",
        "--no-data", "--skip-comments", "--skip-add-drop-table",
        "--skip-lock-tables", "--default-character-set=utf8mb4",
        db_name, table_name
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return None

    # 清理 mysqldump 噪音
    lines = []
    for line in result.stdout.splitlines():
        if line.startswith("/*!40") or line.startswith("/*!50"):
            continue
        if line.startswith("--"):
            continue
        # 去掉 AUTO_INCREMENT=N
        line = re.sub(r'\s*AUTO_INCREMENT=\d+', '', line)
        lines.append(line)

    # 去掉首尾空行
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()

    return "\n".join(lines) if lines else None


def find_create_table_block(content, table_name):
    """在 init SQL 内容中找到指定表的 CREATE TABLE 块的起止位置"""
    # 匹配 CREATE TABLE `table_name` ( ... ) ENGINE=... ;
    pattern = re.compile(
        r'(-- ' + re.escape(table_name) + r'\n)?'  # 可选的注释行
        r'CREATE TABLE `' + re.escape(table_name) + r'`\s*\(',
        re.IGNORECASE
    )

    match = pattern.search(content)
    if not match:
        return None, None

    start = match.start()

    # 找到这个 CREATE TABLE 语句的结束分号
    # 从 match 开始往后找，需要找到最外层的 ) ENGINE=... ;
    pos = match.end()
    depth = 1  # 已经进入了第一个 (
    while pos < len(content) and depth > 0:
        if content[pos] == '(':
            depth += 1
        elif content[pos] == ')':
            depth -= 1
        pos += 1

    # 现在 pos 在 ) 后面，继续找到 ;
    semicolon = content.find(';', pos)
    if semicolon == -1:
        return None, None

    end = semicolon + 1

    # 包含后面的空行
    while end < len(content) and content[end] == '\n':
        end += 1

    return start, end


def sync_table(content, table_name, new_ddl):
    """替换或新增一个表的 DDL"""
    start, end = find_create_table_block(content, table_name)

    new_block = f"-- {table_name}\n{new_ddl}\n"

    if start is not None:
        # 替换
        content = content[:start] + new_block + "\n" + content[end:]
        return content, "updated"
    else:
        # 新增到末尾
        if not content.endswith("\n"):
            content += "\n"
        content += "\n" + new_block
        return content, "added"


def remove_table(content, table_name):
    """从 init SQL 中移除一个表"""
    start, end = find_create_table_block(content, table_name)
    if start is not None:
        content = content[:start] + content[end:]
        return content, "removed"
    return content, "not_found"


def main():
    parser = argparse.ArgumentParser(description="增量更新 init SQL 中的表 DDL")
    parser.add_argument("tables", nargs="+", help="要更新的表名")
    parser.add_argument("--init-file", default="wms-agent/local-dev/init-sql/WMS_INIT.sql", help="init SQL 文件路径")
    parser.add_argument("--container", default="wms-mysql", help="MySQL 容器名")
    parser.add_argument("--db-user", default="root")
    parser.add_argument("--db-pass", default="root123")
    parser.add_argument("--db-name", default="xp_wms")
    args = parser.parse_args()

    # 读取 init 文件
    try:
        with open(args.init_file, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"错误: {args.init_file} 不存在，请先运行 export_schema.sh 生成全量基线")
        sys.exit(1)

    results = []
    for table in args.tables:
        new_ddl = get_table_ddl(args.container, args.db_user, args.db_pass, args.db_name, table)
        if new_ddl is None:
            # 表不存在（可能被 DROP 了）
            content, status = remove_table(content, table)
            results.append((table, status))
        else:
            content, status = sync_table(content, table, new_ddl)
            results.append((table, status))

    # 写回文件
    with open(args.init_file, "w", encoding="utf-8") as f:
        f.write(content)

    # 输出结果
    for table, status in results:
        print(f"  {table}: {status}")

    print(f"init 脚本更新完成: {args.init_file}")


if __name__ == "__main__":
    main()
