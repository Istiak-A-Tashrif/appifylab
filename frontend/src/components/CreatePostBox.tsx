import { useState } from "react";
import DesignImage from './DesignImage';
import { designUser } from "../data/feed";
import { PencilIcon, PhotoIcon, VideoIcon, ArticleIcon, SendPostIcon } from "./icons";
import { uploadToCloudinary } from '../utils/cloudinary';
import type { CreatePostInput, Visibility } from '../types/feed';

interface Props { onPost: (input: CreatePostInput) => Promise<void> }
type UploadStatus = 'idle' | 'selected' | 'uploading' | 'posting' | 'posted' | 'error';
export default function CreatePostBox({ onPost }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [focused, setFocused] = useState(false);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      if (image) { setUploadStatus('uploading'); setUploadMessage('Uploading photo…'); }
      const uploaded = image ? await uploadToCloudinary(image) : undefined;
      setUploadStatus('posting'); setUploadMessage('Posting…');
      await onPost({ text: trimmed, visibility, imageUrl: uploaded?.secure_url });
      setUploadStatus('posted'); setUploadMessage('Posted');
      setText(""); setImage(null);
    } catch (error) {
      setUploadStatus('error'); setUploadMessage((error as Error).message);
    } finally { setSubmitting(false); }
  }

  const optionButtons = (
    <>
      <div className="_feed_inner_text_area_bottom_photo _feed_common">
        <label className="_feed_inner_text_area_bottom_photo_link" style={{cursor:"pointer"}}>
          <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
            <PhotoIcon />
          </span>
          Photo
          <input hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e)=>{const file=e.target.files?.[0]||null;setImage(file);setUploadStatus(file?'selected':'idle');setUploadMessage(file?`Selected: ${file.name}`:'')}}/>
        </label>
      </div>
      <div className="_feed_inner_text_area_bottom_video _feed_common">
        <button type="button" className="_feed_inner_text_area_bottom_photo_link">
          <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
            <VideoIcon />
          </span>
          Video
        </button>
      </div>
      <div className="_feed_inner_text_area_bottom_event _feed_common">
        <select aria-label="Post visibility" className="_feed_inner_text_area_bottom_photo_link" value={visibility} onChange={(e)=>setVisibility(e.target.value as Visibility)}>
          <option value="PUBLIC">Public</option><option value="PRIVATE">Private</option>
        </select>
      </div>
      <div className="_feed_inner_text_area_bottom_article _feed_common">
        <button type="button" className="_feed_inner_text_area_bottom_photo_link">
          <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
            <ArticleIcon />
          </span>
          Article
        </button>
      </div>
    </>
  );

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div className="_feed_inner_text_area_box_image">
          <DesignImage src={designUser.avatar} alt="Image" className="_txt_img" />
        </div>
        <div className="form-floating _feed_inner_text_area_box_form">
          <textarea
            className="form-control _textarea"
            placeholder=" "
            id="floatingTextarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {!focused && !text && <label className="_feed_textarea_label" htmlFor="floatingTextarea">
            Write something ...
            <PencilIcon />
          </label>}
        </div>
      </div>

      {uploadStatus !== 'idle' && <p role="status" aria-live="polite" className="_mar_t10" style={{color:uploadStatus==='error'?'#ff4d4f':uploadStatus==='posted'?'#18a058':'#666',fontSize:13}}>{uploadMessage}</p>}

      <div className="_feed_inner_text_area_bottom">
        <div className="_feed_inner_text_area_item">{optionButtons}</div>
        <div className="_feed_inner_text_area_btn">
          <button disabled={submitting} type="button" className="_feed_inner_text_area_btn_link" onClick={handleSubmit}>
            <SendPostIcon /> <span>Post</span>
          </button>
        </div>
      </div>

      <div className="_feed_inner_text_area_bottom_mobile">
        <div className="_feed_inner_text_mobile">
          <div className="_feed_inner_text_area_item">{optionButtons}</div>
          <div className="_feed_inner_text_area_btn">
            <button disabled={submitting} type="button" className="_feed_inner_text_area_btn_link" onClick={handleSubmit}>
              <SendPostIcon /> <span>Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
