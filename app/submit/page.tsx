'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Plus, X, Loader2 } from 'lucide-react';
import { extractPDFTextCombined, getPDFPageCount, generatePDFHash } from '@/lib/utils/pdf';
import { generateEnhancedFingerprint } from '@/lib/utils/fingerprint';
import AltchaWidget from '@/app/components/AltchaWidget';

interface Author {
  name: string;
  affiliation: string;
  email: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState<string>('');
  const [altchaVerified, setAltchaVerified] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    highlights: '',
  });

  const [authors, setAuthors] = useState<Author[]>([
    { name: '', affiliation: '', email: '' }
  ]);

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const addAuthor = () => {
    setAuthors([...authors, { name: '', affiliation: '', email: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('PDF 文件不能超过 2MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('只能上传 PDF 文件');
        return;
      }
      setPdfFile(file);
      setError('');
    }
  };

  const handleAltchaVerified = (payload: string) => {
    setAltchaPayload(payload);
    setAltchaVerified(true);
    setError('');
  };

  const handleAltchaStateChange = (state: string) => {
    if (state !== 'verified') {
      setAltchaVerified(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setIsExtracting(true);

    try {
      // 验证必填字段
      if (!formData.title || !formData.abstract || !formData.keywords || !pdfFile) {
        setError('请填写所有必填字段');
        setIsSubmitting(false);
        setIsExtracting(false);
        return;
      }

      // 验证至少有一个作者
      const validAuthors = authors.filter(a => a.name && a.affiliation && a.email);
      if (validAuthors.length === 0) {
        setError('至少需要一位作者信息');
        setIsSubmitting(false);
        setIsExtracting(false);
        return;
      }

      // 验证 ALTCHA
      if (!altchaVerified || !altchaPayload) {
        setError('请完成验证码验证');
        setIsSubmitting(false);
        setIsExtracting(false);
        return;
      }

      // 在客户端检查 PDF 页数
      const pageCount = await getPDFPageCount(pdfFile);
      if (pageCount > 10) {
        setError(`PDF 页数超过限制（${pageCount} 页，最多 10 页）`);
        setIsSubmitting(false);
        setIsExtracting(false);
        return;
      }

      // 在客户端生成 PDF 哈希值
      const pdfHash = await generatePDFHash(pdfFile);

      // 在客户端提取 PDF 文本（包括 OCR）
      setExtractionProgress(0);
      const { combinedText } = await extractPDFTextCombined(pdfFile, (progress) => {
        setExtractionProgress(Math.round(progress));
      });

      setIsExtracting(false);

      // 生成设备指纹
      const fingerprint = await generateEnhancedFingerprint();

      // 创建 FormData
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('abstract', formData.abstract);
      submitData.append('keywords', formData.keywords);
      submitData.append('highlights', formData.highlights);
      submitData.append('authors', JSON.stringify(validAuthors));
      submitData.append('pdf', pdfFile);
      submitData.append('extractedText', combinedText); // 发送提取的文本
      submitData.append('pdfHash', pdfHash); // 发送 PDF 哈希值
      submitData.append('pageCount', pageCount.toString()); // 发送页数
      submitData.append('altchaPayload', altchaPayload);
      submitData.append('fingerprint', fingerprint); // 发送设备指纹

      // 提交到 API
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '提交失败');
      }

      // 成功后跳转到成功页面
      router.push('/submit/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
      setIsSubmitting(false);
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-5xl font-bold text-center">
            Holy S.H.I.T
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Satirical Humor in Interdisciplinary Thinking
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="border-4 border-black p-8">
          <h2 className="font-serif text-4xl font-bold mb-2">投稿排泄</h2>
          <p className="text-gray-600 mb-8">
            请填写以下信息提交您的学术讽刺作品
          </p>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 标题 */}
            <div>
              <label className="block font-bold mb-2">
                论文标题 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                placeholder="请输入论文标题"
                required
              />
            </div>

            {/* 摘要 */}
            <div>
              <label className="block font-bold mb-2">
                摘要 <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] h-32"
                placeholder="请输入论文摘要"
                required
              />
            </div>

            {/* 关键词 */}
            <div>
              <label className="block font-bold mb-2">
                关键词 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                placeholder="用逗号分隔，例如：讽刺, 学术, 幽默"
                required
              />
            </div>

            {/* 亮点 */}
            <div>
              <label className="block font-bold mb-2">
                研究亮点（可选）
              </label>
              <textarea
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] h-24"
                placeholder="简要描述本研究的主要亮点"
              />
            </div>

            {/* 作者信息 */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block font-bold">
                  作者信息 <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={addAuthor}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} />
                  添加作者
                </button>
              </div>

              {authors.map((author, index) => (
                <div key={index} className="border-2 border-gray-300 p-4 mb-4 relative">
                  {authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    >
                      <X size={20} />
                    </button>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        姓名 <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={author.name}
                        onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        placeholder="作者姓名"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        单位 <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={author.affiliation}
                        onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        placeholder="所属单位"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        邮箱 <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        value={author.email}
                        onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        placeholder="联系邮箱"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PDF 上传 */}
            <div>
              <label className="block font-bold mb-2">
                论文 PDF <span className="text-red-600">*</span>
              </label>
              <div className="border-2 border-dashed border-black p-8 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                  id="pdf-upload"
                  required
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload size={48} className="text-gray-400" />
                  {pdfFile ? (
                    <div>
                      <p className="font-semibold text-[#D4AF37]">{pdfFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">点击上传 PDF 文件</p>
                      <p className="text-sm text-gray-500">最大 2MB，不超过 10 页</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* ALTCHA 验证 */}
            <div>
              <label className="block font-bold mb-2">
                安全验证 <span className="text-red-600">*</span>
              </label>
              <AltchaWidget
                onVerified={handleAltchaVerified}
                onStateChange={handleAltchaStateChange}
              />
              {!altchaVerified && (
                <p className="text-sm text-gray-500 mt-2">
                  请完成上方验证后才能提交
                </p>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !altchaVerified}
                className="flex-1 bg-black text-white px-8 py-4 font-bold text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {isExtracting ? `提取文本中... ${extractionProgress}%` : '提交中...'}
                  </>
                ) : (
                  '提交投稿'
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-8 py-4 border-2 border-black font-bold text-lg hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                取消
              </button>
            </div>

            {/* OCR 进度提示 */}
            {isExtracting && (
              <div className="bg-blue-50 border-2 border-blue-500 text-blue-700 px-4 py-3">
                <p className="font-semibold">正在提取 PDF 文本...</p>
                <p className="text-sm">
                  {extractionProgress < 100
                    ? '正在使用 OCR 识别图片中的文字，这可能需要几秒钟...'
                    : '文本提取完成，正在提交...'}
                </p>
                <div className="mt-2 bg-blue-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
