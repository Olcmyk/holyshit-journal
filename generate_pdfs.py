#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import re

# 注册中文字体
try:
    pdfmetrics.registerFont(TTFont('SimSun', '/System/Library/Fonts/STHeiti Light.ttc'))
    pdfmetrics.registerFont(TTFont('SimSunBold', '/System/Library/Fonts/STHeiti Medium.ttc'))
    chinese_font = 'SimSun'
    chinese_font_bold = 'SimSunBold'
except:
    try:
        pdfmetrics.registerFont(TTFont('SimSun', '/System/Library/Fonts/PingFang.ttc'))
        pdfmetrics.registerFont(TTFont('SimSunBold', '/System/Library/Fonts/PingFang.ttc'))
        chinese_font = 'SimSun'
        chinese_font_bold = 'SimSunBold'
    except:
        print("警告: 无法加载中文字体")
        chinese_font = 'Helvetica'
        chinese_font_bold = 'Helvetica-Bold'

def extract_key_sections(content):
    """提取关键章节：标题、作者、摘要、主要发现、结论"""
    lines = content.split('\n')

    sections = {
        'title': '',
        'authors': '',
        'abstract': '',
        'key_findings': [],
        'conclusion': '',
    }

    current_section = None
    in_findings = False
    findings_count = 0

    for line in lines:
        line = line.strip()

        # 提取标题（第一个一级标题）
        if line.startswith('# ') and not sections['title']:
            sections['title'] = line[2:].strip()
            continue

        # 提取作者
        if line.startswith('**作者') or line.startswith('**Authors'):
            sections['authors'] = line.replace('**', '').strip()
            continue

        # 提取机构
        if line.startswith('**机构') or line.startswith('**Institution'):
            sections['authors'] += ' | ' + line.replace('**', '').strip()
            continue

        # 摘要部分
        if line.startswith('## 摘要') or line.startswith('## Abstract'):
            current_section = 'abstract'
            continue

        # 主要发现
        if line.startswith('## 主要发现') or line.startswith('## Key Findings') or line.startswith('## 结果'):
            current_section = 'findings'
            in_findings = True
            continue

        # 结论
        if line.startswith('## 结论') or line.startswith('## Conclusion'):
            current_section = 'conclusion'
            in_findings = False
            continue

        # 遇到新的二级标题，停止当前section
        if line.startswith('## ') and current_section:
            if current_section == 'abstract':
                current_section = None
            elif current_section == 'findings':
                in_findings = False

        # 收集内容
        if current_section == 'abstract' and line and not line.startswith('#'):
            sections['abstract'] += line + ' '

        elif in_findings and findings_count < 5:  # 只取前5个要点
            if line.startswith('###') or line.startswith('**'):
                sections['key_findings'].append(line.replace('###', '').replace('**', '').strip())
                findings_count += 1
            elif line.startswith('- ') or line.startswith('* ') or re.match(r'^\d+\.', line):
                sections['key_findings'].append(line)
                findings_count += 1

        elif current_section == 'conclusion' and line and not line.startswith('#'):
            if len(sections['conclusion']) < 500:  # 限制结论长度
                sections['conclusion'] += line + ' '

    return sections

def create_compact_pdf(md_file, pdf_file):
    """创建精简版PDF（2-3页）"""

    # 读取Markdown文件
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取关键内容
    sections = extract_key_sections(content)

    # 创建PDF文档
    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm
    )

    # 创建样式
    styles = getSampleStyleSheet()

    # 标题样式
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=chinese_font_bold,
        fontSize=18,
        textColor='black',
        spaceAfter=12,
        alignment=TA_CENTER,
        leading=24
    )

    # 作者样式
    author_style = ParagraphStyle(
        'AuthorStyle',
        parent=styles['Normal'],
        fontName=chinese_font,
        fontSize=9,
        textColor='#666666',
        spaceAfter=16,
        alignment=TA_CENTER,
        leading=12
    )

    # 章节标题样式
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName=chinese_font_bold,
        fontSize=12,
        textColor='black',
        spaceAfter=8,
        spaceBefore=12,
        leading=16
    )

    # 正文样式（更紧凑）
    body_style = ParagraphStyle(
        'CompactBody',
        parent=styles['BodyText'],
        fontName=chinese_font,
        fontSize=9,
        textColor='black',
        spaceAfter=4,
        alignment=TA_JUSTIFY,
        leading=13
    )

    # 要点样式
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['BodyText'],
        fontName=chinese_font,
        fontSize=9,
        textColor='black',
        spaceAfter=3,
        leftIndent=15,
        leading=13
    )

    story = []

    # 添加标题
    if sections['title']:
        story.append(Paragraph(sections['title'], title_style))

    # 添加作者信息
    if sections['authors']:
        story.append(Paragraph(sections['authors'], author_style))

    # 添加摘要
    if sections['abstract']:
        story.append(Paragraph('<b>摘要</b>', section_style))
        # 限制摘要长度
        abstract_text = sections['abstract'][:600] + ('...' if len(sections['abstract']) > 600 else '')
        story.append(Paragraph(abstract_text, body_style))
        story.append(Spacer(1, 0.3*cm))

    # 添加主要发现
    if sections['key_findings']:
        story.append(Paragraph('<b>主要发现</b>', section_style))
        for i, finding in enumerate(sections['key_findings'][:8]):  # 最多8个要点
            # 清理文本
            finding_text = finding.replace('**', '').replace('###', '').strip()
            if finding_text.startswith('-') or finding_text.startswith('*'):
                finding_text = '• ' + finding_text[1:].strip()
            elif re.match(r'^\d+\.', finding_text):
                finding_text = '• ' + re.sub(r'^\d+\.\s*', '', finding_text)
            else:
                finding_text = '• ' + finding_text

            # 限制每个要点长度
            if len(finding_text) > 200:
                finding_text = finding_text[:200] + '...'

            story.append(Paragraph(finding_text, bullet_style))
        story.append(Spacer(1, 0.3*cm))

    # 添加结论
    if sections['conclusion']:
        story.append(Paragraph('<b>结论</b>', section_style))
        # 限制结论长度
        conclusion_text = sections['conclusion'][:500] + ('...' if len(sections['conclusion']) > 500 else '')
        story.append(Paragraph(conclusion_text, body_style))

    # 添加页脚说明
    story.append(Spacer(1, 0.5*cm))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontName=chinese_font,
        fontSize=7,
        textColor='#999999',
        alignment=TA_CENTER,
        leading=10
    )
    story.append(Paragraph('本文档为精简版，完整内容请参阅原始论文', footer_style))

    # 生成PDF
    doc.build(story)
    print(f"✓ 已生成精简版: {pdf_file}")

def main():
    # 论文文件列表
    papers = [
        'papers/pdf/paper1_procrastination.md',
        'papers/pdf/paper2_wifi.md',
        'papers/pdf/paper3_monday.md',
        'papers/pdf/paper4_phone_battery.md',
        'papers/pdf/paper5_food_photos.md',
        'papers/pdf/paper6_sleep.md',
        'papers/pdf/paper7_express_delivery.md',
        'papers/pdf/paper8_group_chat.md',
        'papers/pdf/paper9_food_delivery_review.md',
        'papers/pdf/paper10_last_game.md'
    ]

    # 创建输出目录
    os.makedirs('papers/pdf', exist_ok=True)

    # 转换每个文件
    for paper in papers:
        if os.path.exists(paper):
            pdf_name = os.path.basename(paper).replace('.md', '.pdf')
            pdf_path = f'papers/pdf/{pdf_name}'
            try:
                create_compact_pdf(paper, pdf_path)
            except Exception as e:
                print(f"✗ 转换失败 {paper}: {e}")
                import traceback
                traceback.print_exc()
        else:
            print(f"✗ 文件不存在: {paper}")

    print("\n所有精简版PDF文件已生成在 papers/pdf/ 目录中")
    print("每个PDF约2-3页，包含：标题、作者、摘要、主要发现、结论")

if __name__ == '__main__':
    main()
