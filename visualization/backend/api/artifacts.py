from flask import Blueprint, request, jsonify
import os
import json
import re

artifacts_bp = Blueprint('artifacts', __name__)

ARTIFACT_SUBDIRS = {
    'structured': 'structured',
    'reports': 'reports',
    'docs': 'docs',
    'features': 'features',
    'review': 'review',
    'prototype': 'docs/05-prototype'
}

STAGE_FILES = {
    '01': {'name': '产品分析', 'json': '01-product-analysis.json', 'md': '01-product-analysis.md', 'review_json': '01-product-analysis-review.json', 'review_md': '01-product-analysis-review.md'},
    '02': {'name': '竞品研究', 'json': '02-competitor-research.json', 'md': '02-competitor-research.md', 'review_json': '02-competitor-research-review.json', 'review_md': '02-competitor-research-review.md'},
    '03': {'name': '创新分析', 'json': '03-innovation-analysis.json', 'md': '03-innovation-analysis.md', 'review_json': '03-innovation-analysis-review.json', 'review_md': '03-innovation-analysis-review.md'},
    '04': {'name': '需求文档', 'json': '04-requirements-document.json', 'md': '04-requirements-document.md', 'review_json': '04-requirements-document-review.json', 'review_md': '04-requirements-document-review.md'},
    '05': {'name': '原型设计', 'prototype': True, 'review_json': '05-prototype-review.json', 'review_md': '05-prototype-review.md'},
}


def get_artifact_tree(artifact_root, base_root=None):
    if base_root is None:
        base_root = artifact_root
    tree = []
    if not os.path.exists(artifact_root):
        return tree

    for item in sorted(os.listdir(artifact_root)):
        item_path = os.path.join(artifact_root, item)
        if os.path.isdir(item_path):
            children = get_artifact_tree(item_path, base_root)
            tree.append({
                'name': item,
                'type': 'directory',
                'path': os.path.relpath(item_path, artifact_root),
                'children': children
            })
        else:
            ext = os.path.splitext(item)[1].lower()
            file_type = 'unknown'
            if ext in ['.md', '.markdown']:
                file_type = 'markdown'
            elif ext in ['.json']:
                file_type = 'json'
            elif ext in ['.html', '.htm']:
                file_type = 'html'
            elif ext in ['.js']:
                file_type = 'javascript'
            elif ext in ['.css']:
                file_type = 'css'
            elif ext in ['.txt']:
                file_type = 'text'
            tree.append({
                'name': item,
                'type': 'file',
                'fileType': file_type,
                'path': os.path.relpath(item_path, base_root)
            })
    return tree


def get_artifact_manifest(artifact_root):
    manifest = {
        'phases': [],
        'features': [],
        'reports': [],
        'reviews': []
    }

    if not os.path.exists(artifact_root):
        return manifest

    for stage_id, stage_info in STAGE_FILES.items():
        stage_path = os.path.join(artifact_root, 'structured', stage_info.get('json', ''))
        md_path = os.path.join(artifact_root, 'docs', stage_info.get('md', ''))
        review_json_path = os.path.join(artifact_root, 'review', stage_info.get('review_json', ''))
        review_md_path = os.path.join(artifact_root, 'review', stage_info.get('review_md', ''))

        if stage_info.get('prototype'):
            prototype_path = os.path.join(artifact_root, 'docs', '05-prototype', 'index.html')
            manifest['phases'].append({
                'id': stage_id,
                'name': stage_info['name'],
                'type': 'prototype',
                'files': {
                    'index': 'docs/05-prototype/index.html' if os.path.exists(prototype_path) else None,
                },
                'review': {
                    'json': f'review/{stage_info.get("review_json", "")}' if os.path.exists(review_json_path) else None,
                    'md': f'review/{stage_info.get("review_md", "")}' if os.path.exists(review_md_path) else None
                }
            })
        else:
            manifest['phases'].append({
                'id': stage_id,
                'name': stage_info['name'],
                'type': 'phase',
                'files': {
                    'json': f'structured/{stage_info.get("json", "")}' if os.path.exists(stage_path) else None,
                    'md': f'docs/{stage_info.get("md", "")}' if os.path.exists(md_path) else None,
                },
                'review': {
                    'json': f'review/{stage_info.get("review_json", "")}' if os.path.exists(review_json_path) else None,
                    'md': f'review/{stage_info.get("review_md", "")}' if os.path.exists(review_md_path) else None
                }
            })

    features_dir = os.path.join(artifact_root, 'features')
    if os.path.exists(features_dir):
        for f in sorted(os.listdir(features_dir)):
            if f.endswith('.md') and not f.startswith('artifact-manifest'):
                manifest['features'].append({
                    'name': f,
                    'path': f'features/{f}'
                })

    reports_dir = os.path.join(artifact_root, 'reports')
    if os.path.exists(reports_dir):
        for f in sorted(os.listdir(reports_dir)):
            manifest['reports'].append({
                'name': f,
                'path': f'reports/{f}'
            })

    return manifest


@artifacts_bp.route('/artifacts', methods=['GET'])
def get_artifacts():
    project_path = request.args.get('path', '')
    if not project_path:
        project_path = os.path.dirname(os.path.dirname(os.getcwd()))

    if not project_path:
        return jsonify({
            'success': False,
            'error': 'path parameter is required'
        }), 400

    real_path = os.path.realpath(project_path)
    if not os.path.exists(real_path):
        return jsonify({
            'success': False,
            'error': 'path does not exist'
        }), 404

    artifact_root = os.path.join(real_path, '.aet', 'prd')

    tree = get_artifact_tree(artifact_root)
    manifest = get_artifact_manifest(artifact_root)

    return jsonify({
        'success': True,
        'data': {
            'projectPath': real_path,
            'projectName': os.path.basename(real_path),
            'artifactRoot': artifact_root,
            'tree': tree,
            'manifest': manifest
        }
    }), 200


@artifacts_bp.route('/artifacts/read', methods=['GET'])
def read_artifact():
    project_path = request.args.get('path', '')
    file_rel_path = request.args.get('file', '')

    if not project_path:
        project_path = os.path.dirname(os.path.dirname(os.getcwd()))
    if not project_path or not file_rel_path:
        return jsonify({
            'success': False,
            'error': 'path and file parameters are required'
        }), 400

    real_project_path = os.path.realpath(project_path)
    artifact_root = os.path.join(real_project_path, '.aet', 'prd')
    full_path = os.path.join(artifact_root, file_rel_path)
    real_full_path = os.path.realpath(full_path)

    if not real_full_path.startswith(os.path.realpath(artifact_root)):
        return jsonify({
            'success': False,
            'error': 'Invalid path'
        }), 403

    if not os.path.exists(real_full_path):
        return jsonify({
            'success': False,
            'error': 'File not found'
        }), 404

    with open(real_full_path, 'r', encoding='utf-8') as f:
        content = f.read()

    ext = os.path.splitext(file_rel_path)[1].lower()
    if ext in ['.json']:
        try:
            data = json.loads(content)
            return jsonify({
                'success': True,
                'data': {
                    'path': file_rel_path,
                    'type': 'json',
                    'content': data
                }
            }), 200
        except json.JSONDecodeError:
            pass

    return jsonify({
        'success': True,
        'data': {
            'path': file_rel_path,
            'type': 'text',
            'content': content
        }
    }), 200


@artifacts_bp.route('/artifacts/markdown', methods=['GET'])
def read_markdown():
    project_path = request.args.get('path', '')
    file_rel_path = request.args.get('file', '')

    if not project_path:
        project_path = os.path.dirname(os.path.dirname(os.getcwd()))
    if not project_path or not file_rel_path:
        return jsonify({
            'success': False,
            'error': 'path and file parameters are required'
        }), 400

    real_project_path = os.path.realpath(project_path)
    artifact_root = os.path.join(real_project_path, '.aet', 'prd')
    full_path = os.path.join(artifact_root, file_rel_path)
    real_full_path = os.path.realpath(full_path)

    if not real_full_path.startswith(os.path.realpath(artifact_root)):
        return jsonify({
            'success': False,
            'error': 'Invalid path'
        }), 403

    if not os.path.exists(real_full_path):
        return jsonify({
            'success': False,
            'error': 'File not found'
        }), 404

    with open(real_full_path, 'r', encoding='utf-8') as f:
        content = f.read()

    return jsonify({
        'success': True,
        'data': {
            'path': file_rel_path,
            'type': 'markdown',
            'content': content
        }
    }), 200


@artifacts_bp.route('/artifacts/preview', methods=['GET'])
def preview_artifact():
    project_path = request.args.get('path', '')
    file_rel_path = request.args.get('file', '')

    if not project_path:
        project_path = os.path.dirname(os.path.dirname(os.getcwd()))
    if not project_path or not file_rel_path:
        return 'path and file parameters are required', 400

    real_project_path = os.path.realpath(project_path)
    artifact_root = os.path.join(real_project_path, '.aet', 'prd')
    full_path = os.path.join(artifact_root, file_rel_path)
    real_full_path = os.path.realpath(full_path)

    if not real_full_path.startswith(os.path.realpath(artifact_root)):
        return 'Invalid path', 403

    if not os.path.exists(real_full_path):
        return 'File not found', 404

    ext = os.path.splitext(file_rel_path)[1].lower()
    if ext not in ['.html', '.htm']:
        return 'Not an HTML file', 400

    with open(real_full_path, 'r', encoding='utf-8') as f:
        content = f.read()

    dir_path = os.path.dirname(file_rel_path)

    def fix_src_href(m):
        attr = m.group(1)
        url = m.group(3)
        if url.startswith(('http://', 'https://', '//', 'data:', 'javascript:', 'mailto:', '/')):
            return m.group(0)
        full_path = os.path.normpath(os.path.join(dir_path, url)).replace('\\', '/') if dir_path else url
        if url.endswith('.html') or url.endswith('.htm'):
            return f'{attr}="/api/artifacts/preview?path={project_path}&file={full_path}"'
        return f'{attr}="/api/artifacts/file?path={project_path}&file={full_path}"'

    content = re.sub(r'(href|src)=(["\'])([^"\']+)\2', fix_src_href, content)

    from flask import make_response
    response = make_response(content)
    response.headers['Content-Type'] = 'text/html; charset=utf-8'
    return response


@artifacts_bp.route('/artifacts/features', methods=['GET'])
def get_features():
    """Get all features grouped by status for kanban view."""
    project_path = request.args.get('path', '')
    if not project_path:
        project_path = os.path.dirname(os.path.dirname(os.getcwd()))

    real_path = os.path.realpath(project_path)
    if not os.path.exists(real_path):
        return jsonify({'success': False, 'error': 'path does not exist'}), 404

    artifact_root = os.path.join(real_path, '.aet', 'prd')
    features_dir = os.path.join(artifact_root, 'features')

    if not os.path.exists(features_dir):
        return jsonify({'success': True, 'data': {'features': [], 'by_status': {}}}), 200

    features = []
    by_status = {}
    for f in sorted(os.listdir(features_dir)):
        if not f.endswith('.md') or f.startswith('artifact-manifest'):
            continue

        full_path = os.path.join(features_dir, f)
        with open(full_path, 'r', encoding='utf-8') as fp:
            content = fp.read()

        feature = parse_feature_from_content(f, content)
        features.append(feature)

    for feat in features:
        status = feat.get('status', 'unknown')
        if status not in by_status:
            by_status[status] = []
        by_status[status].append(feat)

    return jsonify({
        'success': True,
        'data': {
            'features': features,
            'by_status': by_status
        }
    }), 200


def parse_feature_from_content(filename, content):
    """Parse feature metadata from markdown content."""
    result = {
        'id': filename.replace('.md', ''),
        'name': filename.replace('.md', ''),
        'path': f'features/{filename}',
        'priority': 'medium',
        'status': 'pending',
        'version': 'v1.0',
        'linked_issue': None,
        'issue_url': None
    }

    lines = content.split('\n')
    in_frontmatter = False
    
    for i, line in enumerate(lines):
        if line.strip() == '---':
            in_frontmatter = not in_frontmatter
            continue
        
        if in_frontmatter and ':' in line:
            key, value = line.split(':', 1)
            key_lower = key.strip().lower()
            value_clean = value.strip().strip('"').strip("'")
            
            if key_lower == 'feature_id':
                result['id'] = value_clean
            elif key_lower == 'feature_name':
                result['name'] = value_clean
            elif key_lower == 'priority':
                result['priority'] = value_clean
            elif key_lower == 'status':
                result['status'] = value_clean
            elif key_lower == 'dev_status':
                if not result['status'] or result['status'] == 'pending':
                    result['status'] = value_clean
            elif key_lower == 'version':
                result['version'] = value_clean
            elif key_lower == 'linked_issue':
                result['linked_issue'] = value_clean
            elif key_lower == 'issue_url':
                result['issue_url'] = value_clean

    status = result['status'].lower()
    if status in ['pending', '待开始', '未开始', '待实现', '待认领']:
        result['status'] = 'pending'
    elif status in ['in_progress', '进行中', '进行', '实现中']:
        result['status'] = 'in_progress'
    elif status in ['completed', '已完成', '完成', '已实现', '已处理']:
        result['status'] = 'completed'
    elif status in ['review', '审核中', '评审中', '评审']:
        result['status'] = 'review'
    elif status in ['approved', '已批准', '批准']:
        result['status'] = 'approved'
    elif status in ['rejected', '已拒绝', '拒绝']:
        result['status'] = 'rejected'

    priority = result['priority'].lower()
    if priority in ['high', '高', '高优先级', 'p0', 'p1', 'p0,p1']:
        result['priority'] = 'high'
    elif priority in ['medium', '中', '中优先级', 'p2']:
        result['priority'] = 'medium'
    elif priority in ['low', '低', '低优先级', 'p3']:
        result['priority'] = 'low'

    return result


@artifacts_bp.route('/artifacts/file', methods=['GET'])
def serve_artifact_file():
    project_path = request.args.get('path', '')
    file_rel_path = request.args.get('file', '')

    if not project_path:
        project_path = os.path.dirname(os.path.dirname(os.getcwd()))
    if not project_path or not file_rel_path:
        return 'path and file parameters are required', 400

    real_project_path = os.path.realpath(project_path)
    artifact_root = os.path.join(real_project_path, '.aet', 'prd')
    full_path = os.path.join(artifact_root, file_rel_path)
    real_full_path = os.path.realpath(full_path)

    if not real_full_path.startswith(os.path.realpath(artifact_root)):
        return 'Invalid path', 403

    if not os.path.exists(real_full_path):
        return 'File not found', 404

    if os.path.isdir(real_full_path):
        return 'Path is a directory', 400

    from flask import make_response
    ext = os.path.splitext(file_rel_path)[1].lower()
    mime_types = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
    }
    content_type = mime_types.get(ext, 'text/plain')
    with open(real_full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    response = make_response(content)
    response.headers['Content-Type'] = content_type
    return response
