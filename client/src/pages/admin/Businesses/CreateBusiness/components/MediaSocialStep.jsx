import React from "react";
import FormField from "../../../../../components/forms/FormField/FormField";
import MultiInput from "../../../../../components/forms/MultiInput/MultiInput";

const ImagePreview = ({ url, label }) => {
    if (!url) return null;
    return (
        <div className="mt-2 group relative">
            <div className="w-20 h-20 rounded-xl border-2 border-secondary-200 overflow-hidden bg-secondary-50 transition-all group-hover:border-primary-400">
                <img
                    src={url}
                    alt={label || "Preview"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = "https://placehold.co/100x100?text=Invalid+URL";
                    }}
                />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Preview
            </span>
        </div>
    );
};

const extractUrl = (input) => {
    if (typeof input !== "string") return input;
    const match = input.match(/src=["'](.*?)["']/);
    return match ? match[1] : input.trim();
};

const MediaSocialStep = ({ formData, handleChange, handleArrayAdd, handleArrayRemove }) => {
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
                        <div>
                            <FormField
                                label="Logo Image (URL)"
                                name="images.logo"
                                value={formData.images.logo}
                                onChange={(val) => handleChange({ target: { name: "images.logo", value: val } })}
                                placeholder="https://..."
                            />
                            <ImagePreview url={formData.images.logo} label="Logo" />
                        </div>
                        <div>
                            <FormField
                                label="Cover Banner (URL)"
                                name="images.banner"
                                value={formData.images.banner}
                                onChange={(val) => handleChange({ target: { name: "images.banner", value: val } })}
                                placeholder="https://..."
                            />
                            <ImagePreview url={formData.images.banner} label="Banner" />
                        </div>
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
                        <MultiInput
                            label="External Image Gallery"
                            value={formData.images.gallery}
                            onChange={(val) => handleArrayAdd("images.gallery", val)}
                            onRemove={(idx) => handleArrayRemove("images.gallery", idx)}
                            placeholder="Paste image URLs"
                        />
                        {formData.images.gallery.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-3">
                                {formData.images.gallery.map((url, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="w-16 h-16 rounded-lg border border-secondary-200 overflow-hidden bg-secondary-50 hover:border-primary-400 transition-all">
                                            <img
                                                src={url}
                                                alt={`Gallery ${idx}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = "https://placehold.co/100x100?text=Error";
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleArrayRemove("images.gallery", idx)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
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
