from pathlib import Path
import pypdfium2 as pdfium
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw
root=Path(__file__).resolve().parents[1]
path=root/'output/pdf/dfa-presentation-guide.pdf'
reader=PdfReader(path)
assert len(reader.pages)==8
for i,p in enumerate(reader.pages):
    text=p.extract_text()
    assert len(text)>300, (i,len(text))
    assert '\ufffd' not in text
pdf=pdfium.PdfDocument(str(path))
thumbs=[]
for i in range(len(pdf)):
    img=pdf[i].render(scale=1.2).to_pil()
    img.save(root/f'tmp/pdfs/page-{i+1}.png')
    img.thumbnail((300,425))
    tile=Image.new('RGB',(320,452),'#dce3d8')
    tile.paste(img,((320-img.width)//2,8))
    ImageDraw.Draw(tile).text((12,434),f'Page {i+1}',fill='#203d2e')
    thumbs.append(tile)
sheet=Image.new('RGB',(1280,904),'#dce3d8')
for i,img in enumerate(thumbs):sheet.paste(img,((i%4)*320,(i//4)*452))
sheet.save(root/'tmp/pdfs/contact-sheet.png')
print('PDF validated and rendered: 8 pages')
