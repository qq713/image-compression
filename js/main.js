// DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.querySelector('.upload-btn');
const compressionSection = document.querySelector('.compression-section');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

let originalFile = null;
let compressedBlob = null;

// 事件监听器
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);
qualitySlider.addEventListener('input', handleQualityChange);
downloadBtn.addEventListener('click', handleDownload);

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// 处理拖放
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    }
}

// 处理文件处理和压缩
async function processFile(file) {
    originalFile = file;
    
    // 显示原始图片预览和大小
    originalPreview.src = URL.createObjectURL(file);
    originalSize.textContent = formatFileSize(file.size);
    
    // 显示压缩区域
    compressionSection.style.display = 'block';
    
    // 进行初始压缩
    await compressImage();
}

// 处理质量变化
async function handleQualityChange(e) {
    const quality = e.target.value;
    qualityValue.textContent = quality + '%';
    await compressImage();
}

// 图片压缩函数
async function compressImage() {
    if (!originalFile) return;
    
    const quality = qualitySlider.value / 100;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 创建图片对象
    const img = new Image();
    img.src = URL.createObjectURL(originalFile);
    
    await new Promise((resolve) => {
        img.onload = () => {
            // 设置画布尺寸
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 绘制图片
            ctx.drawImage(img, 0, 0);
            
            // 转换为Blob
            canvas.toBlob(
                (blob) => {
                    compressedBlob = blob;
                    compressedPreview.src = URL.createObjectURL(blob);
                    compressedSize.textContent = formatFileSize(blob.size);
                    resolve();
                },
                originalFile.type,
                quality
            );
        };
    });
}

// 处理下载
function handleDownload() {
    if (!compressedBlob) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    
    // 生成文件名
    const extension = originalFile.name.split('.').pop();
    const filename = originalFile.name.replace(
        '.' + extension,
        '_compressed.' + extension
    );
    
    link.download = filename;
    link.click();
}

// 辅助函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 