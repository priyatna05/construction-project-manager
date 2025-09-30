export const isImage = file => {
  if (!file) return false;

  const type = file?.type ?? '';
  const name = file?.name ?? '';

  const imageTypes = [
    'image/jpeg',
    'image/gif',
    'image/png',
    'image/svg',
    'image/webp',
    '.jpeg',
    '.jpg',
    '.gif',
    '.png',
    '.svg',
    '.webp',
    '.bmp',
  ];

  return imageTypes.some(
    ext => type.toLowerCase().includes(ext) || name.toLowerCase().includes(ext)
  );
};

export const isViewable = file => {
  if (!file) return false;

  const type = file?.type ?? '';
  const name = file?.name ?? '';

  const video = ['.mp4', '.ogg', '.webm'];
  const audio = ['.mp3', '.wav', '.ogg', '.wma'];
  const document = ['.pdf', '.docx'];

  const viewable = [...video, ...audio, ...document];

  return viewable.some(ext => type.toLowerCase().includes(ext) || name.toLowerCase().includes(ext));
};

export const shortenFileName = (name, maxLength = 30) => {
  if (name.length <= maxLength) return name;

  const ext = name.includes('.') ? name.substring(name.lastIndexOf('.')) : '';
  const base = name.substring(0, maxLength - ext.length - 3);
  return base + '...' + ext;
};

export const download = (data, filename, mime, bom) => {
  var blobData = typeof bom !== 'undefined' ? [bom, data] : [data];
  var blob = new Blob(blobData, { type: mime || 'application/octet-stream' });
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    var blobURL =
      window.URL && window.URL.createObjectURL
        ? window.URL.createObjectURL(blob)
        : window.webkitURL.createObjectURL(blob);
    var tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobURL;
    tempLink.setAttribute('download', filename);

    if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank');
    }
    document.body.appendChild(tempLink);
    tempLink.click();

    setTimeout(function () {
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobURL);
    }, 200);
  }
};
