import React, { useState } from "react";
import FormField from "../../../../../components/forms/FormField/FormField";
import MultiInput from "../../../../../components/forms/MultiInput/MultiInput";
import { FaUpload, FaLink, FaTrashAlt, FaPlus } from "react-icons/fa";

const ImagePreview = ({ file, url, label, onRemove }) => {
    const previewUrl = file ? URL.createObjectURL(file) : url;
    if (!previewUrl) return null;
    return (
        <div className="mt-2 group relative inline-block">
            <div className="w-24 h-24 rounded-xl border-2 border-secondary-200 overflow-hidden bg-secondary-50 transition-all group-hover:border-primary-400">
                <img
                    src={previewUrl}
                    alt={label || "Preview"}
                    className="w-full h-full object-cover"
                    onLoad={() => file && URL.revokeObjectURL(previewUrl)}
                    onError={(e) => {
                        e.target.src = "https://placehold.co/100x100?text=Invalid+Image";
                    }}
                />
            </div>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                    <FaTrashAlt size={10} />
                </button>
            )}
            <span className="absolute -bottom-1 -right-1 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {file ? "File" : "URL"}
            </span>
        </div>
    );
};

const ImageInputSelector = ({ label, name, value, file, onChange, onFileChange, onRemoveFile, placeholder }) => {
    const [mode, setMode] = useState(file ? "file" : "url");

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-secondary-700">{label}</label>
                <div className="flex bg-secondary-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setMode("url")}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${mode === "url" ? "bg-white text-primary-600 shadow-sm" : "text-secondary-500"}`}
                    >
                        <FaLink className="inline mr-1" /> URL
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("file")}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${mode === "file" ? "bg-white text-primary-600 shadow-sm" : "text-secondary-500"}`}
                    >
                        <FaUpload className="inline mr-1" /> UPLOAD
                    </button>
                </div>
            </div>

            {mode === "url" ? (
                <div className="relative">
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-secondary-900 placeholder:text-secondary-400 font-medium bg-white"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                    />
                    <FaLink className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-300" />
                </div>
            ) : (
                <div className="relative">
                    <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer group">
                            <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-secondary-200 group-hover:border-primary-400 group-hover:bg-primary-50/50 transition-all">
                                <FaUpload className="text-secondary-400 group-hover:text-primary-500" />
                                <span className="text-sm font-semibold text-secondary-500 group-hover:text-primary-700">
                                    {file ? file.name : "Choose file..."}
                                </span>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => onFileChange(e.target.files[0])}
                            />
                        </label>
                    </div>
                </div>
            )}
            <ImagePreview url={value} file={file} label={label} onRemove={mode === "file" && file ? onRemoveFile : null} />
        </div>
    );
};

const extractUrl = (input) => {
    if (typeof input !== "string") return input;
    const match = input.match(/src=["'](.*?)["']/);
    return match ? match[1] : input.trim();
};

const MediaSocialStep = ({ formData, handleChange, handleArrayAdd, handleArrayRemove, handleFileChange, handleFileRemove }) => {
    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Media Presence</h2>
                <p className="text-secondary-500 font-medium">Link your visual assets and social channels.</p>
            </div>

            <div className="space-y-10">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6">Brand Assets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageInputSelector
                            label="Logo Image"
                            name="images.logo"
                            value={formData.images.logo}
                            file={formData.files?.logo}
                            onChange={(val) => handleChange({ target: { name: "images.logo", value: val } })}
                            onFileChange={(file) => handleFileChange("logo", file)}
                            onRemoveFile={() => handleFileRemove("logo")}
                            placeholder="https://..."
                        />
                        <ImageInputSelector
                            label="Cover Banner"
                            name="images.banner"
                            value={formData.images.banner}
                            file={formData.files?.banner}
                            onChange={(val) => handleChange({ target: { name: "images.banner", value: val } })}
                            onFileChange={(file) => handleFileChange("banner", file)}
                            onRemoveFile={() => handleFileRemove("banner")}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="mt-8">
                        <ImageInputSelector
                            label="Thumbnail Image"
                            name="images.thumbnail"
                            value={formData.images.thumbnail}
                            file={formData.files?.thumbnail}
                            onChange={(val) => handleChange({ target: { name: "images.thumbnail", value: val } })}
                            onFileChange={(file) => handleFileChange("thumbnail", file)}
                            onRemoveFile={() => handleFileRemove("thumbnail")}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="mt-8 pt-8 border-t border-secondary-100">
                        <MultiInput
                            label="Google 360 Virtual Tour (Image/Video URLs)"
                            value={formData.google360ImageUrl}
                            onChange={(val) => handleArrayAdd("google360ImageUrl", extractUrl(val))}
                            onRemove={(idx) => handleArrayRemove("google360ImageUrl", idx)}
                            placeholder="Paste 360 image or tour URLs"
                            helperText="Add links to your Google 360 views or virtual tours."
                        />
                        {formData.google360ImageUrl.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-3">
                                {formData.google360ImageUrl.map((url, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="w-24 h-16 rounded-lg border border-secondary-200 overflow-hidden bg-secondary-900 flex items-center justify-center hover:border-primary-400 transition-all cursor-pointer group-hover:bg-secondary-800">
                                            {url.includes('google.com/maps/embed') ? (
                                                <div className="text-[10px] text-white font-bold flex flex-col items-center">
                                                    <span className="opacity-60 uppercase tracking-tighter">Tour</span>
                                                    <span>{idx + 1}</span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={url}
                                                    alt={`Tour ${idx}`}
                                                    className="w-full h-full object-cover opacity-60"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="bg-primary-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black italic">360°</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleArrayRemove("google360ImageUrl", idx)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-bold text-secondary-700">Gallery (URLs & Uploads)</label>
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg cursor-pointer hover:bg-primary-100 transition-all text-xs font-bold">
                                <FaPlus /> Upload New
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        Array.from(e.target.files).forEach(file => handleFileChange("gallery", file));
                                    }}
                                />
                            </label>
                        </div>
                        
                        <MultiInput
                            value={formData.images.gallery}
                            onChange={(val) => handleArrayAdd("images.gallery", val)}
                            onRemove={(idx) => handleArrayRemove("images.gallery", idx)}
                            placeholder="Paste external image URL and press Enter"
                        />

                        {/* Combined Gallery Preview (Files + URLs) */}
                        {(formData.images.gallery.length > 0 || formData.files?.gallery?.length > 0) && (
                            <div className="mt-6 flex flex-wrap gap-4">
                                {/* URL Images */}
                                {formData.images.gallery.map((url, idx) => (
                                    <div key={`url-${idx}`} className="relative group">
                                        <div className="w-20 h-20 rounded-xl border-2 border-secondary-200 overflow-hidden bg-secondary-50 hover:border-primary-400 transition-all shadow-sm">
                                            <img
                                                src={url}
                                                alt={`Gallery URL ${idx}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = "https://placehold.co/100x100?text=Error";
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleArrayRemove("images.gallery", idx)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                        >
                                            ×
                                        </button>
                                        <span className="absolute -bottom-1 -left-1 bg-secondary-500 text-white text-[8px] px-1 py-0.5 rounded font-bold">URL</span>
                                    </div>
                                ))}

                                {/* Uploaded Files */}
                                {formData.files?.gallery?.map((file, idx) => (
                                    <div key={`file-${idx}`} className="relative group">
                                        <div className="w-20 h-20 rounded-xl border-2 border-primary-100 overflow-hidden bg-primary-50 hover:border-primary-400 transition-all shadow-sm">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Gallery File ${idx}`}
                                                className="w-full h-full object-cover"
                                                onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleFileRemove("gallery", idx)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                        >
                                            ×
                                        </button>
                                        <span className="absolute -bottom-1 -left-1 bg-primary-500 text-white text-[8px] px-1 py-0.5 rounded font-bold">FILE</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-secondary-100">
                        <MultiInput
                            label="Business Video URLs (YouTube/Vimeo)"
                            value={formData.videos}
                            onChange={(val) => handleArrayAdd("videos", val)}
                            onRemove={(idx) => handleArrayRemove("videos", idx)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            helperText="Add links to your business promotional videos."
                        />
                    </div>
                </div>

                <div className="pt-10 border-t border-secondary-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6">Social Networks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {['facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'youtube'].map((platform) => (
                            <FormField
                                key={platform}
                                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                name={`socialMedia.${platform}`}
                                value={formData.socialMedia[platform]}
                                onChange={(val) => handleChange({ target: { name: `socialMedia.${platform}`, value: val } })}
                                placeholder={`${platform}.com/yourpage`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaSocialStep;
