import { useState, useEffect, useRef } from 'react';
import { 
  X, Sun, Contrast, Volume2, VolumeX, Type, 
  Sparkles, Save, Image as ImageIcon, Video as VideoIcon, 
  Upload, Trash2, Sliders, Music, Award
} from 'lucide-react';
const MediaEditor = ({ isOpen, onClose, media, onSave }) => {
  // Photo editing states
  const [brightness, setBrightness] = useState(100); // 0 - 200%
  const [contrast, setContrast] = useState(100); // 0 - 200%
  const [saturation, setSaturation] = useState(100); // 0 - 200%
  const [hue, setHue] = useState(0); // 0 - 360 deg

  // Shared Text styling states
  const [text, setText] = useState(() => media?.editMetadata?.text || '');
  const [textStyle, setTextStyle] = useState(() => media?.editMetadata?.text_style || 'classic'); // 'classic', 'neon', 'typewriter'
  const [textPosition, setTextPosition] = useState(() => media?.editMetadata?.text_position || 'upper-third'); // 'upper-third', 'center', 'lower-third'

  // Video specific states
  const [muteAudio, setMuteAudio] = useState(() => media?.editMetadata?.mute_audio || false);
  const [audioFile, setAudioFile] = useState(() => media?.audioFile || null); // Custom audio file
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(() => media?.audioFile ? URL.createObjectURL(media.audioFile) : '');
  const [logoFile, setLogoFile] = useState(() => media?.logoFile || null); // Custom logo file
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(() => media?.logoFile ? URL.createObjectURL(media.logoFile) : '');
  const [logoPosition, setLogoPosition] = useState(() => media?.editMetadata?.logo_position || 'top-center'); // 'top-center', 'bottom-center'
  const [logoScale, setLogoScale] = useState(() => media?.editMetadata?.logo_scale || 50); // 10% - 100%
  const [subtitleFile, setSubtitleFile] = useState(() => media?.subtitleFile || null);
  const [subtitlePreviewUrl, setSubtitlePreviewUrl] = useState(() => media?.subtitleFile ? URL.createObjectURL(media.subtitleFile) : '');
  const [trackUrl, setTrackUrl] = useState('');

  // Canvas ref for image preview & processing
  const canvasRef = useRef(null);
  const audioInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const subtitleInputRef = useRef(null);

  const isVideo = media?.type === 'video';

  // Handle Photo Canvas rendering
  useEffect(() => {
    if (isVideo) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = media.previewUrl;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Fit image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply CSS-like filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg)`;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Reset filters for text rendering
      ctx.filter = 'none';

      // Draw Text Overlay
      if (text.trim() !== '') {
        const fontSize = Math.floor(canvas.height / 16);
        let x = canvas.width / 2;
        let y = canvas.height / 4; // upper-third

        if (textPosition === 'center') {
          y = canvas.height / 2;
        } else if (textPosition === 'lower-third') {
          y = (canvas.height * 3) / 4;
        }

        // Draw background box for typewriter
        if (textStyle === 'typewriter') {
          ctx.font = `bold ${fontSize}px Courier New, monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const metrics = ctx.measureText(text);
          const paddingX = fontSize * 0.4;
          const paddingY = fontSize * 0.25;
          const textWidth = metrics.width;
          const textHeight = fontSize;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(
            x - textWidth / 2 - paddingX,
            y - textHeight / 2 - paddingY,
            textWidth + paddingX * 2,
            textHeight + paddingY * 2
          );

          ctx.fillStyle = 'white';
          ctx.fillText(text, x, y);
        } else if (textStyle === 'neon') {
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          ctx.shadowColor = '#ff00ff';
          ctx.shadowBlur = fontSize * 0.25;
          
          ctx.strokeStyle = 'white';
          ctx.lineWidth = fontSize * 0.06;
          ctx.strokeText(text, x, y);

          ctx.fillStyle = '#ff00ff';
          ctx.fillText(text, x, y);

          ctx.shadowBlur = 0; // reset
        } else { // 'classic'
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          ctx.strokeStyle = 'black';
          ctx.lineWidth = fontSize * 0.08;
          ctx.strokeText(text, x, y);

          ctx.fillStyle = 'white';
          ctx.fillText(text, x, y);
        }
      }
    };
  }, [brightness, contrast, saturation, hue, text, textStyle, textPosition, media.previewUrl, isVideo]);

  // Convert SRT subtitles to WebVTT format for browser live track rendering
  useEffect(() => {
    let active = true;
    if (!subtitleFile) {
      setTimeout(() => {
        if (active) setTrackUrl('');
      }, 0);
      return;
    }

    if (subtitleFile.name.endsWith('.vtt')) {
      const url = URL.createObjectURL(subtitleFile);
      setTimeout(() => {
        if (active) setTrackUrl(url);
      }, 0);
      return () => {
        active = false;
        URL.revokeObjectURL(url);
      };
    }

    // Convert SRT to WebVTT
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!active) return;
      const srtText = e.target.result;
      // Convert comma timestamps to dot format (e.g. 00:00:01,234 -> 00:00:01.234)
      const vttText = "WEBVTT\n\n" + srtText.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2');
      const blob = new Blob([vttText], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);
      setTrackUrl(url);
    };
    reader.readAsText(subtitleFile);
    return () => {
      active = false;
    };
  }, [subtitleFile]);

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      if (subtitlePreviewUrl) URL.revokeObjectURL(subtitlePreviewUrl);
      if (trackUrl) URL.revokeObjectURL(trackUrl);
    };
  }, [audioPreviewUrl, logoPreviewUrl, subtitlePreviewUrl, trackUrl]);

  // Audio Upload Handle
  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));
  };

  // Logo Upload Handle
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  // Subtitle Upload Handle
  const handleSubtitleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (subtitlePreviewUrl) URL.revokeObjectURL(subtitlePreviewUrl);
    setSubtitleFile(file);
    setSubtitlePreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (isVideo) {
      // Save Video metadata and tracks
      const editMetadata = {
        text: text.trim(),
        text_style: textStyle,
        text_position: textPosition,
        logo_position: logoPosition,
        logo_scale: Number(logoScale),
        mute_audio: muteAudio,
        has_audio: !!audioFile,
        has_logo: !!logoFile,
        has_subtitles: !!subtitleFile
      };

      onSave({
        ...media,
        editMetadata,
        audioFile,
        logoFile,
        subtitleFile
      });
    } else {
      // Save Photo Canvas Blob
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob((blob) => {
        const file = new File([blob], media.file.name, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(file);
        
        onSave({
          ...media,
          file,
          previewUrl
        });
      }, 'image/jpeg', 0.9);
    }
    onClose();
  };

  if (!isOpen || !media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border border-gray-800/80 shadow-2xl bg-gray-950/90 text-white">
        
        {/* Modal Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-900 bg-gray-950/80">
          <div className="flex items-center gap-2.5">
            {isVideo ? (
              <VideoIcon className="text-instagram-pink" size={20} />
            ) : (
              <ImageIcon className="text-instagram-pink" size={20} />
            )}
            <h3 className="font-bold text-base">Edit Media: {media.file.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-900 text-gray-400 hover:text-white transition duration-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Side: Preview Area */}
          <div className="md:col-span-7 bg-black/60 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-900 min-h-[300px] md:min-h-0 relative">
            {isVideo ? (
              <div className="w-full max-w-[320px] aspect-[9/16] relative bg-black rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center">
                {/* Simulated video playback */}
                <video 
                  src={media.previewUrl} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  loop 
                  muted={muteAudio} 
                >
                  {trackUrl && (
                    <track 
                      src={trackUrl} 
                      kind="subtitles" 
                      srcLang="en" 
                      label="English" 
                      default 
                    />
                  )}
                </video>

                {/* Simulated Logo Overlay */}
                {logoPreviewUrl && (
                  <div 
                    className={`absolute left-1/2 -translate-x-1/2 p-1 bg-black/30 rounded backdrop-blur-sm ${
                      logoPosition === 'top-center' ? 'top-4' : 'bottom-4'
                    }`}
                    style={{ width: `${logoScale}%`, maxWidth: '90%' }}
                  >
                    <img 
                      src={logoPreviewUrl} 
                      alt="Logo watermark" 
                      className="w-full h-auto object-contain opacity-80" 
                    />
                  </div>
                )}

                {/* Simulated Text Overlay */}
                {text.trim() !== '' && (
                  <div className={`absolute left-4 right-4 text-center select-none ${
                    textPosition === 'upper-third' ? 'top-1/4 -translate-y-1/2' :
                    textPosition === 'center' ? 'top-1/2 -translate-y-1/2' :
                    'bottom-1/4 translate-y-1/2'
                  }`}>
                    {textStyle === 'typewriter' ? (
                      <span className="px-3 py-1.5 bg-black/80 font-mono text-[10px] text-white tracking-wide rounded-md shadow-md leading-relaxed border border-gray-800">
                        {text}
                      </span>
                    ) : textStyle === 'neon' ? (
                      <span 
                        className="font-bold text-xs tracking-wider text-[#ff00ff] drop-shadow-[0_0_8px_#ff00ff]"
                        style={{ WebkitTextStroke: '0.5px white' }}
                      >
                        {text}
                      </span>
                    ) : (
                      <span className="font-extrabold text-xs tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {text}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-h-[50vh] flex items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-[48vh] rounded-xl shadow-lg object-contain border border-gray-900" 
                />
              </div>
            )}
          </div>

          {/* Right Side: Edit Controls Panel */}
          <div className="md:col-span-5 p-6 space-y-6">
            
            {/* Filter Adjustments (Photos Only) */}
            {!isVideo && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 border-b border-gray-900 pb-2">
                  <Sliders size={16} className="text-instagram-pink" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Adjustments</h4>
                </div>
                
                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Sun size={12} /> Brightness</span>
                    <span className="font-medium text-white">{brightness}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" value={brightness} 
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-instagram-pink bg-gray-800 h-1 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Contrast size={12} /> Contrast</span>
                    <span className="font-medium text-white">{contrast}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" value={contrast} 
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-instagram-pink bg-gray-800 h-1 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Sparkles size={12} /> Saturation</span>
                    <span className="font-medium text-white">{saturation}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" value={saturation} 
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-instagram-pink bg-gray-800 h-1 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Hue Rotation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Hue Shift</span>
                    <span className="font-medium text-white">{hue}°</span>
                  </div>
                  <input 
                    type="range" min="0" max="360" value={hue} 
                    onChange={(e) => setHue(Number(e.target.value))}
                    className="w-full accent-instagram-pink bg-gray-800 h-1 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Text Overlay Section (Both Photo & Video) */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-gray-900 pb-2">
                <Type size={16} className="text-instagram-pink" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Text Hook Overlay</h4>
              </div>

              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase">Hook Text</label>
                <input 
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter hook (e.g. 50% Off Now!)"
                  maxLength={50}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-instagram-pink/60 text-xs"
                />
              </div>

              {text.trim() !== '' && (
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  {/* Style Presets */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">Style</label>
                    <select 
                      value={textStyle}
                      onChange={(e) => setTextStyle(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-instagram-pink/60"
                    >
                      <option value="classic">Classic</option>
                      <option value="neon">Neon (Glowing)</option>
                      <option value="typewriter">Typewriter</option>
                    </select>
                  </div>

                  {/* Position Preset */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">Position</label>
                    <select 
                      value={textPosition}
                      onChange={(e) => setTextPosition(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-instagram-pink/60"
                    >
                      <option value="upper-third">Upper Third</option>
                      <option value="center">Center</option>
                      <option value="lower-third">Lower Third</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Video-Only Settings (Audio, Mute, Watermark Logo) */}
            {isVideo && (
              <div className="space-y-5 pt-1">
                {/* Audio Settings */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-gray-900 pb-2">
                    <Music size={16} className="text-instagram-pink" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Audio Options</h4>
                  </div>

                  {/* Mute Audio */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/30 border border-gray-800/40">
                    <span className="text-xs text-gray-300 flex items-center gap-1.5">
                      {muteAudio ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-green-400" />}
                      Mute Original Audio
                    </span>
                    <button
                      type="button"
                      onClick={() => setMuteAudio(!muteAudio)}
                      className={`w-10 h-5 rounded-full transition duration-300 p-0.5 cursor-pointer flex items-center ${
                        muteAudio ? 'bg-instagram-pink justify-end' : 'bg-gray-800 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-md inline-block" />
                    </button>
                  </div>

                  {/* Custom Audio File */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase flex items-center gap-1">
                      Background Audio (Trims automatically)
                    </label>
                    <input 
                      type="file" accept="audio/*" ref={audioInputRef} onChange={handleAudioChange} className="hidden"
                    />
                    {audioFile ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-instagram-pink/5 border border-instagram-pink/20">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Music size={13} className="text-instagram-pink shrink-0" />
                          <span className="text-xs text-white truncate max-w-[160px]">{audioFile.name}</span>
                        </div>
                        <button 
                          onClick={() => { setAudioFile(null); if(audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl); setAudioPreviewUrl(''); }}
                          className="text-gray-400 hover:text-red-500 transition duration-150 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => audioInputRef.current.click()}
                        className="w-full flex items-center justify-center py-2.5 border border-dashed border-gray-800 hover:border-gray-700 bg-gray-900/10 hover:bg-gray-900/30 text-gray-400 hover:text-white rounded-xl text-xs gap-1.5 transition duration-200 cursor-pointer"
                      >
                        <Upload size={13} /> Upload Audio File
                      </button>
                    )}
                  </div>
                </div>

                {/* Logo Watermark Settings */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-gray-900 pb-2">
                    <Award size={16} className="text-instagram-pink" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Brand Logo Watermark</h4>
                  </div>

                  <div className="space-y-2">
                    <input 
                      type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoChange} className="hidden"
                    />
                    {logoFile ? (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-instagram-pink/5 border border-instagram-pink/20">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <ImageIcon size={13} className="text-instagram-pink shrink-0" />
                            <span className="text-xs text-white truncate max-w-[160px]">{logoFile.name}</span>
                          </div>
                          <button 
                            onClick={() => { setLogoFile(null); if(logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl); setLogoPreviewUrl(''); }}
                            className="text-gray-400 hover:text-red-500 transition duration-150 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        
                        {/* Logo Position */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-400 font-semibold uppercase">Logo Placement</label>
                          <select 
                            value={logoPosition}
                            onChange={(e) => setLogoPosition(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-instagram-pink/60"
                          >
                            <option value="top-center">Top Center</option>
                            <option value="bottom-center">Bottom Center</option>
                          </select>
                        </div>

                        {/* Logo Scale (Slider) */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-gray-400 font-semibold uppercase">
                            <span>Logo Size</span>
                            <span className="text-white font-bold">{logoScale}%</span>
                          </div>
                          <input 
                            type="range" min="10" max="100" value={logoScale} 
                            onChange={(e) => setLogoScale(Number(e.target.value))}
                            className="w-full accent-instagram-pink bg-gray-900 h-1.5 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => logoInputRef.current.click()}
                        className="w-full flex items-center justify-center py-2.5 border border-dashed border-gray-800 hover:border-gray-700 bg-gray-900/10 hover:bg-gray-900/30 text-gray-400 hover:text-white rounded-xl text-xs gap-1.5 transition duration-200 cursor-pointer"
                      >
                        <Upload size={13} /> Upload Logo Image
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtitles Settings */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-gray-900 pb-2">
                    <Type size={16} className="text-instagram-pink" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Subtitles (SRT / VTT)</h4>
                  </div>

                  <div className="space-y-2">
                    <input 
                      type="file" accept=".srt,.vtt" ref={subtitleInputRef} onChange={handleSubtitleChange} className="hidden"
                    />
                    {subtitleFile ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-instagram-pink/5 border border-instagram-pink/20">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Type size={13} className="text-instagram-pink shrink-0" />
                          <span className="text-xs text-white truncate max-w-[160px]">{subtitleFile.name}</span>
                        </div>
                        <button 
                          onClick={() => { setSubtitleFile(null); if(subtitlePreviewUrl) URL.revokeObjectURL(subtitlePreviewUrl); setSubtitlePreviewUrl(''); }}
                          className="text-gray-400 hover:text-red-500 transition duration-150 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => subtitleInputRef.current.click()}
                        className="w-full flex items-center justify-center py-2.5 border border-dashed border-gray-800 hover:border-gray-700 bg-gray-900/10 hover:bg-gray-900/30 text-gray-400 hover:text-white rounded-xl text-xs gap-1.5 transition duration-200 cursor-pointer"
                      >
                        <Upload size={13} /> Upload Subtitle File (.srt, .vtt)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 flex items-center justify-end border-t border-gray-900 bg-gray-950/80 gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs border border-gray-800 hover:bg-gray-900 rounded-xl text-gray-400 hover:text-white font-semibold transition duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4.5 py-2 text-xs bg-gradient-to-r from-instagram-orange to-instagram-pink hover:brightness-110 active:scale-[0.98] rounded-xl text-white font-bold flex items-center gap-1.5 transition duration-200 cursor-pointer"
          >
            <Save size={13} /> Save Edits
          </button>
        </div>

      </div>
    </div>
  );
};

export default MediaEditor;
