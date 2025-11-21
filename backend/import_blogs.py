"""
博客文件导入脚本
用于将blog_files目录下的MD文件导入到数据库中
"""
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

# 导入数据库相关模块
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus

# 导入模型
from models import Blog
from database import Base

# 数据库配置
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "Poisson@123",
    "name": "jiuwen_website"
}

def get_database_url() -> str:
    """获取数据库连接URL"""
    encoded_password = quote_plus(DB_CONFIG["password"])
    return f"mysql+pymysql://{DB_CONFIG['user']}:{encoded_password}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['name']}?charset=utf8mb4"

def create_database_session():
    """创建数据库会话"""
    engine = create_engine(get_database_url())
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def parse_md_file(file_path: str) -> Dict[str, Any]:
    """
    解析MD文件内容
    
    Args:
        file_path: MD文件路径
        
    Returns:
        包含博客信息的字典
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取标题（第一个H1标题）
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else os.path.splitext(os.path.basename(file_path))[0]
    
    # 生成摘要（前200个字符，去除特殊字符）
    clean_content = re.sub(r'[\n#`*\[\]()<>]', ' ', content)
    excerpt = clean_content[:200].strip() + '...' if len(clean_content) > 200 else clean_content
    
    # 生成slug（URL友好标识）
    slug = re.sub(r'\s+', '-', re.sub(r'[^\w\s]', '', title.lower()))
    
    # 默认为'admin'作者
    author = "admin"
    
    # 默认为空标签
    tags = "技术博客,openJiuwen"
    
    # 默认无封面图片
    cover_image = ""
    
    # 默认状态为published
    status = "published"
    
    return {
        "title": title,
        "content": content,
        "excerpt": excerpt,
        "author": author,
        "tags": tags,
        "cover_image": cover_image,
        "slug": slug,
        "status": status
    }

def import_blog_to_db(db_session, blog_data: Dict[str, Any]) -> Optional[Blog]:
    """
    将博客数据导入到数据库
    
    Args:
        db_session: 数据库会话
        blog_data: 博客数据字典
        
    Returns:
        创建的Blog对象，如果已存在则返回None
    """
    # 检查是否已存在相同slug的博客
    existing_blog = db_session.query(Blog).filter(Blog.slug == blog_data["slug"]).first()
    if existing_blog:
        print(f"博客 '{blog_data['title']}' 已存在，跳过导入")
        return None
    
    # 创建新博客对象
    blog = Blog(
        title=blog_data["title"],
        content=blog_data["content"],
        excerpt=blog_data["excerpt"],
        author=blog_data["author"],
        tags=blog_data["tags"],
        cover_image=blog_data["cover_image"],
        slug=blog_data["slug"],
        status=blog_data["status"],
    )
    
    # 添加到数据库
    db_session.add(blog)
    db_session.commit()
    print(f"成功导入博客: '{blog.title}'")
    return blog

def import_all_blogs_from_directory(directory_path: str) -> None:
    """
    导入目录下所有MD文件到数据库
    
    Args:
        directory_path: 包含MD文件的目录路径
    """
    # 检查目录是否存在
    if not os.path.exists(directory_path):
        print(f"错误: 目录 '{directory_path}' 不存在")
        return
    
    # 创建数据库会话
    db_session = create_database_session()
    
    try:
        # 确保数据库表存在
        Base.metadata.create_all(bind=db_session.get_bind())
        
        # 获取所有MD文件
        md_files = list(Path(directory_path).glob("*.md"))
        print(f"找到 {len(md_files)} 个MD文件")
        
        # 导入每个文件
        imported_count = 0
        for md_file in md_files:
            try:
                print(f"正在处理文件: {md_file.name}")
                blog_data = parse_md_file(str(md_file))
                if import_blog_to_db(db_session, blog_data):
                    imported_count += 1
            except Exception as e:
                print(f"处理文件 '{md_file.name}' 时出错: {e}")
                db_session.rollback()
        
        print(f"导入完成，共导入 {imported_count} 篇博客")
        
    except Exception as e:
        print(f"导入过程中发生错误: {e}")
        db_session.rollback()
    finally:
        db_session.close()

def delete_all_blogs(db_session) -> None:
    """
    删除数据库中的所有博客
    
    Args:
        db_session: 数据库会话
    """
    try:
        # 执行删除操作
        db_session.query(Blog).delete()
        db_session.commit()
        print("成功删除所有博客")
    except Exception as e:
        db_session.rollback()
        print(f"删除博客时出错: {e}")

if __name__ == "__main__":
    # 博客文件目录
    BLOG_FILES_DIR = "/opt/huawei/data/jiuwen/official_website/docusaurus/blog_files"
    
    # 删除所有博客
    print("开始删除所有博客...")
    # 创建数据库会话
    db_session = create_database_session()
    delete_all_blogs(db_session)
    print("删除所有博客完成")
    print("开始导入博客文件...")
    import_all_blogs_from_directory(BLOG_FILES_DIR)
    print("导入任务完成!")