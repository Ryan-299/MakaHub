import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Key,
  CheckSquare,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Trash2,
  Star,
  Plus,
  AlertCircle,
  Video,
  FileVideo,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyType } from '../types';
import { getCounties, getSubCountiesInCounty, getWardsInSubCounty } from '../utils/kenyaLocations';
import { PropertyLocationPickerMap } from '../components/PropertyLocationPickerMap';
import {
  registerSubmittedMedia,
  revokeTemporaryMedia
} from '../utils/mediaRegistry';
import { uploadFileToConvex } from '../lib/convexStorage';
import { isConvexConfigured, convexClient } from '../lib/convex';

const PROPERTY_TYPES: PropertyType[] = [
  'Single Room',
  'Bedsitter',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4+ Bedroom',
  'Studio',
  'Entire House',
  'Own Compound House',
  'Commercial / Shop'
];

const AMENITY_OPTIONS = [
  'Borehole Water / 24/7 Supply',
  'Token Electricity (Prepaid KPLC)',
  'Fibre Internet Ready',
  'CCTV Surveillance & Guard Security',
  'Gated Compound',
  'Dedicated Parking Space',
  'Private Balcony',
  'Built-in Wardrobes',
  'Ceramic Tile Flooring',
  'Pet Friendly',
  'Perimeter Electric Wall',
  'Garbage Collection Included'
];

export const AddPropertyView: React.FC = () => {
  const {
    addPropertyListing,
    updatePropertyListing,
    editingPropertyId,
    setEditingPropertyId,
    properties,
    setCurrentView
  } = useApp();

  const editingProperty = useMemo(
    () => properties.find((p) => p.id === editingPropertyId),
    [properties, editingPropertyId]
  );
  const isEditMode = !!editingProperty;

  // 1. Basic Details
  const [name, setName] = useState(() => editingProperty?.name || 'Sunset Ridge Heights');
  const [type, setType] = useState<PropertyType>(() => editingProperty?.type || '1 Bedroom');
  const [description, setDescription] = useState(
    () =>
      editingProperty?.description ||
      'Spacious, well-ventilated apartment with ceramic tiling, abundant natural light, and modern kitchen cabinetry in a secure gated estate.'
  );

  // 2. Location Details
  const [county, setCounty] = useState(() => editingProperty?.location?.county || 'Nairobi');
  const [subCounty, setSubCounty] = useState(() => editingProperty?.location?.subCounty || 'Kasarani');
  const [ward, setWard] = useState(() => editingProperty?.location?.ward || 'Clay City');
  const [estate, setEstate] = useState(() => editingProperty?.location?.estate || 'Seasons');
  const [address, setAddress] = useState(
    () => editingProperty?.location?.address || 'Near Seasons Supermarket, Kasarani'
  );
  const [lat, setLat] = useState(() => editingProperty?.location?.lat ?? -1.2185);
  const [lng, setLng] = useState(() => editingProperty?.location?.lng ?? 36.9032);

  // 3. Pricing & Fees (All string-based to prevent leading zeros like "08000" and allow clean blanks)
  const [monthlyRent, setMonthlyRent] = useState<string>(() =>
    editingProperty?.monthlyRent ? String(editingProperty.monthlyRent) : ''
  );
  const [deposit, setDeposit] = useState<string>(() =>
    editingProperty?.deposit ? String(editingProperty.deposit) : ''
  );
  const [serviceCharge, setServiceCharge] = useState<string>(() =>
    editingProperty?.serviceCharge ? String(editingProperty.serviceCharge) : ''
  );
  const [waterDeposit, setWaterDeposit] = useState<string>(() =>
    editingProperty?.waterDeposit ? String(editingProperty.waterDeposit) : ''
  );
  const [electricityDeposit, setElectricityDeposit] = useState<string>(() =>
    editingProperty?.electricityDeposit ? String(editingProperty.electricityDeposit) : ''
  );
  const [garbageFee, setGarbageFee] = useState<string>(() =>
    editingProperty?.garbageFee ? String(editingProperty.garbageFee) : ''
  );
  const [agentFee, setAgentFee] = useState<string>(() =>
    editingProperty?.agentFee ? String(editingProperty.agentFee) : ''
  );
  const [viewingFee, setViewingFee] = useState<string>(() =>
    editingProperty?.viewingFee ? String(editingProperty.viewingFee) : ''
  );

  // 4. Availability & Units Breakdown
  const [vacant, setVacant] = useState<string>(() =>
    editingProperty?.vacancies !== undefined && editingProperty?.vacancies !== null
      ? String(editingProperty.vacancies)
      : ''
  );
  const [occupied, setOccupied] = useState<string>(() =>
    editingProperty?.occupied !== undefined && editingProperty?.occupied !== null
      ? String(editingProperty.occupied)
      : ''
  );
  const [underRepair, setUnderRepair] = useState<string>(() =>
    editingProperty?.underRepair !== undefined && editingProperty?.underRepair !== null
      ? String(editingProperty.underRepair)
      : ''
  );

  // 5. Amenities
  const [amenities, setAmenities] = useState<string[]>(() =>
    editingProperty?.amenities && editingProperty.amenities.length > 0
      ? editingProperty.amenities
      : [
          'Borehole Water / 24/7 Supply',
          'Token Electricity (Prepaid KPLC)',
          'Fibre Internet Ready',
          'CCTV Surveillance & Guard Security',
          'Private Balcony'
        ]
  );

  // Media Uploader State (Photos)
  const [images, setImages] = useState<string[]>(() => editingProperty?.images || []);
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>(() =>
    (editingProperty?.images || []).map(() => null)
  );
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createdObjectUrlsRef = useRef<Set<string>>(new Set());

  // Media Uploader State (Video)
  const [videoUrl, setVideoUrl] = useState<string | null>(() => editingProperty?.video || null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const createdVideoUrlRef = useRef<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isSubmittedRef = useRef(false);

  // Helper for numeric inputs: allows empty strings and prevents leading zeros (e.g. 08000 -> 8000)
  const handleNumericChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '') {
        setter('');
        return;
      }
      // Strip any non-digit characters
      const digitsOnly = val.replace(/[^0-9]/g, '');
      if (digitsOnly === '') {
        setter('');
        return;
      }
      // Strip leading zeroes unless the value is strictly "0"
      const sanitized = digitsOnly.replace(/^0+(?=\d)/, '');
      setter(sanitized);
    };

  // Populate state whenever editingProperty changes
  useEffect(() => {
    if (editingProperty) {
      setName(editingProperty.name || '');
      setType(editingProperty.type || '1 Bedroom');
      setDescription(editingProperty.description || '');
      setCounty(editingProperty.location?.county || '');
      setSubCounty(editingProperty.location?.subCounty || '');
      setWard(editingProperty.location?.ward || '');
      setEstate(editingProperty.location?.estate || '');
      setAddress(editingProperty.location?.address || '');
      setLat(editingProperty.location?.lat ?? -1.2185);
      setLng(editingProperty.location?.lng ?? 36.9032);

      setMonthlyRent(editingProperty.monthlyRent ? String(editingProperty.monthlyRent) : '');
      setDeposit(editingProperty.deposit ? String(editingProperty.deposit) : '');
      setServiceCharge(editingProperty.serviceCharge ? String(editingProperty.serviceCharge) : '');
      setWaterDeposit(editingProperty.waterDeposit ? String(editingProperty.waterDeposit) : '');
      setElectricityDeposit(
        editingProperty.electricityDeposit ? String(editingProperty.electricityDeposit) : ''
      );
      setGarbageFee(editingProperty.garbageFee ? String(editingProperty.garbageFee) : '');
      setAgentFee(editingProperty.agentFee ? String(editingProperty.agentFee) : '');
      setViewingFee(editingProperty.viewingFee ? String(editingProperty.viewingFee) : '');

      setVacant(
        editingProperty.vacancies !== undefined && editingProperty.vacancies !== null
          ? String(editingProperty.vacancies)
          : ''
      );
      setOccupied(
        editingProperty.occupied !== undefined && editingProperty.occupied !== null
          ? String(editingProperty.occupied)
          : ''
      );
      setUnderRepair(
        editingProperty.underRepair !== undefined && editingProperty.underRepair !== null
          ? String(editingProperty.underRepair)
          : ''
      );

      setAmenities(editingProperty.amenities || []);
      setImages(editingProperty.images || []);
      setVideoUrl(editingProperty.video || null);
    }
  }, [editingProperty]);

  // Clean up object URLs when component unmounts WITHOUT submitting
  useEffect(() => {
    return () => {
      if (isSubmittedRef.current) {
        return;
      }

      createdObjectUrlsRef.current.forEach((url) => {
        revokeTemporaryMedia(url);
      });
      createdObjectUrlsRef.current.clear();

      if (createdVideoUrlRef.current) {
        revokeTemporaryMedia(createdVideoUrlRef.current);
        createdVideoUrlRef.current = null;
      }
    };
  }, []);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoError(null);

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles: File[] = [];
    let invalidFormatCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isValidExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
      const isValidMime = allowedTypes.includes(file.type.toLowerCase());

      if (isValidMime || isValidExt) {
        validFiles.push(file);
      } else {
        invalidFormatCount++;
      }
    }

    if (invalidFormatCount > 0) {
      setPhotoError(
        `${invalidFormatCount} file(s) skipped. Only JPG, JPEG, PNG, and WebP formats are supported.`
      );
    }

    if (validFiles.length === 0) {
      if (invalidFormatCount > 0) {
        setPhotoError('Invalid image format. Please upload JPG, JPEG, PNG, or WebP files.');
      }
      return;
    }

    const remainingSlots = 10 - images.length;
    if (remainingSlots <= 0) {
      setPhotoError('Maximum of 10 photos already reached for this property.');
      return;
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);
    if (validFiles.length > remainingSlots) {
      setPhotoError(`Added ${remainingSlots} photo(s). Maximum 10 photos allowed per listing.`);
    }

    const newUrls = filesToAdd.map((file) => {
      const url = URL.createObjectURL(file);
      createdObjectUrlsRef.current.add(url);
      return url;
    });

    setImages((prev) => [...prev, ...newUrls]);
    setPhotoFiles((prev) => [...prev, ...filesToAdd]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const urlToRemove = images[indexToRemove];
    if (createdObjectUrlsRef.current.has(urlToRemove)) {
      try {
        URL.revokeObjectURL(urlToRemove);
      } catch {
        // Ignore
      }
      createdObjectUrlsRef.current.delete(urlToRemove);
    }
    const nextImages = images.filter((_, idx) => idx !== indexToRemove);
    setImages(nextImages);
    setPhotoFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (nextImages.length === 0) {
      setPhotoError(null);
    }
  };

  const handleSetCoverPhoto = (indexToMakeCover: number) => {
    if (indexToMakeCover === 0) return;
    setImages((prev) => {
      const target = prev[indexToMakeCover];
      const rest = prev.filter((_, idx) => idx !== indexToMakeCover);
      return [target, ...rest];
    });
    setPhotoFiles((prev) => {
      const target = prev[indexToMakeCover];
      const rest = prev.filter((_, idx) => idx !== indexToMakeCover);
      return [target, ...rest];
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Video Upload Handlers (Section 7)
  const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

  const formatVideoSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleVideoSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setVideoError(null);

    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['mp4', 'webm'];
    const allowedMimes = ['video/mp4', 'video/webm'];

    const isValidExt = allowedExts.includes(ext);
    const isValidMime = allowedMimes.includes(file.type.toLowerCase());

    if (!isValidExt && !isValidMime) {
      setVideoError('Invalid video format. Please upload an MP4 or WebM video file.');
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setVideoError(
        `Video exceeds 100 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a video under 100 MB.`
      );
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    if (createdVideoUrlRef.current) {
      revokeTemporaryMedia(createdVideoUrlRef.current);
    }

    const newUrl = URL.createObjectURL(file);
    createdVideoUrlRef.current = newUrl;
    setVideoUrl(newUrl);
    setVideoFile(file);

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = () => {
    if (createdVideoUrlRef.current) {
      revokeTemporaryMedia(createdVideoUrlRef.current);
      createdVideoUrlRef.current = null;
    }
    setVideoUrl(null);
    setVideoFile(null);
    setVideoError(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoDragging(true);
  };

  const handleVideoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoDragging(false);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleVideoSelected(e.dataTransfer.files);
    }
  };

  // Cascading Location logic from kenyaLocations
  const counties = useMemo(() => getCounties(), []);
  const availableSubCounties = useMemo(() => {
    if (!county) return [];
    return getSubCountiesInCounty(county);
  }, [county]);
  const availableWards = useMemo(() => {
    if (!subCounty) return [];
    return getWardsInSubCounty(subCounty, county);
  }, [subCounty, county]);

  const handleCountyChange = (newCounty: string) => {
    setCounty(newCounty);
    setSubCounty('');
    setWard('');
  };

  const handleSubCountyChange = (newSub: string) => {
    setSubCounty(newSub);
    setWard('');
  };

  const handleWardChange = (newWard: string) => {
    setWard(newWard);
  };

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      setPhotoError('Please add at least one property photo before submitting your listing.');
      const photoSection = document.getElementById('property-photos-section');
      if (photoSection) {
        photoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setPhotoError(null);
    setUploadProgressText('Preparing media for upload...');

    try {
      const imageStorageIds: string[] = [];

      // 1. Upload new photo files to Convex storage
      if (isConvexConfigured && convexClient) {
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          if (file) {
            setUploadProgressText(`Uploading photo ${i + 1} of ${photoFiles.length} to storage...`);
            const storageId = await uploadFileToConvex(file);
            imageStorageIds.push(storageId);
          }
        }
      }

      // 2. Upload video tour file to Convex storage if provided
      let videoStorageId: string | undefined = undefined;
      if (videoFile && isConvexConfigured && convexClient) {
        setUploadProgressText(`Uploading video tour (${formatVideoSize(videoFile.size)})...`);
        videoStorageId = await uploadFileToConvex(videoFile);
      }

      const coverPhotoStorageId = imageStorageIds.length > 0 ? imageStorageIds[0] : undefined;

      isSubmittedRef.current = true;
      const submittedImages = [...images];
      const coverPhoto = submittedImages[0] || '';

      // Register all submitted media in the session registry
      registerSubmittedMedia([...submittedImages, coverPhoto, videoUrl]);

      // Parse all numeric values (empty string converts to 0)
      const parsedMonthlyRent = monthlyRent.trim() !== '' ? Number(monthlyRent) : 0;
      const parsedDeposit = deposit.trim() !== '' ? Number(deposit) : 0;
      const parsedServiceCharge = serviceCharge.trim() !== '' ? Number(serviceCharge) : 0;
      const parsedWaterDeposit = waterDeposit.trim() !== '' ? Number(waterDeposit) : 0;
      const parsedElectricityDeposit = electricityDeposit.trim() !== '' ? Number(electricityDeposit) : 0;
      const parsedGarbageFee = garbageFee.trim() !== '' ? Number(garbageFee) : 0;
      const parsedAgentFee = agentFee.trim() !== '' ? Number(agentFee) : 0;
      const parsedViewingFee = viewingFee.trim() !== '' ? Number(viewingFee) : 0;

      const parsedVacant = vacant.trim() !== '' ? Number(vacant) : 0;
      const parsedOccupied = occupied.trim() !== '' ? Number(occupied) : 0;
      const parsedUnderRepair = underRepair.trim() !== '' ? Number(underRepair) : 0;

      setUploadProgressText('Finalizing listing and saving...');

      if (isEditMode && editingProperty) {
        await updatePropertyListing(editingProperty.id, {
          name,
          type,
          description,
          location: {
            county,
            subCounty,
            ward,
            estate,
            address,
            lat,
            lng,
            distanceMock: editingProperty.location.distanceMock || 1.2
          },
          monthlyRent: parsedMonthlyRent,
          deposit: parsedDeposit,
          serviceCharge: parsedServiceCharge,
          waterDeposit: parsedWaterDeposit,
          electricityDeposit: parsedElectricityDeposit,
          garbageFee: parsedGarbageFee,
          agentFee: parsedAgentFee,
          viewingFee: parsedViewingFee,
          vacancies: parsedVacant,
          occupied: parsedOccupied,
          underRepair: parsedUnderRepair,
          amenities: [...amenities],
          images: submittedImages,
          coverPhoto,
          imageStorageIds: imageStorageIds.length > 0 ? imageStorageIds : editingProperty.imageStorageIds,
          coverPhotoStorageId: coverPhotoStorageId || editingProperty.coverPhotoStorageId,
          videoStorageId: videoStorageId || editingProperty.videoStorageId,
          video: videoUrl || undefined,
          videoName: videoFile?.name || editingProperty.videoName,
          videoSize: videoFile?.size || editingProperty.videoSize
        });
        setEditingPropertyId(null);
      } else {
        await addPropertyListing({
          name,
          type,
          description,
          location: {
            county,
            subCounty,
            ward,
            estate,
            address,
            lat,
            lng,
            distanceMock: 1.2
          },
          monthlyRent: parsedMonthlyRent,
          deposit: parsedDeposit,
          serviceCharge: parsedServiceCharge,
          waterDeposit: parsedWaterDeposit,
          electricityDeposit: parsedElectricityDeposit,
          garbageFee: parsedGarbageFee,
          agentFee: parsedAgentFee,
          viewingFee: parsedViewingFee,
          vacancies: parsedVacant,
          occupied: parsedOccupied,
          underRepair: parsedUnderRepair,
          amenities: [...amenities],
          images: submittedImages,
          coverPhoto,
          imageStorageIds: imageStorageIds.length > 0 ? imageStorageIds : undefined,
          coverPhotoStorageId,
          videoStorageId,
          video: videoUrl || undefined,
          videoName: videoFile?.name,
          videoSize: videoFile?.size
        });
      }

      setSubmitted(true);
      setTimeout(() => {
        setCurrentView('my-listings');
      }, 1800);
    } catch (err: any) {
      console.error('Submission failed:', err);
      isSubmittedRef.current = false;
      setPhotoError(
        err instanceof Error
          ? err.message
          : 'Failed to upload media and submit listing to Convex backend. Please try again.'
      );
      const photoSection = document.getElementById('property-photos-section');
      if (photoSection) {
        photoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgressText('');
    }
  };

  const handleCancelOrBack = () => {
    setEditingPropertyId(null);
    setCurrentView('my-listings');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#000000] pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelOrBack}
              className="p-2 rounded-xl border border-neutral-200 dark:border-[#292929] hover:border-black dark:hover:border-white text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
                {isEditMode ? 'Edit Property' : 'List New Property'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8A8A8A]">
                {isEditMode
                  ? 'Update building specifications, pricing, amenities, photos, and video tour'
                  : 'Provide building specifications, location coordinates, pricing, and availability'}
              </p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="bg-white dark:bg-[#111111] rounded-3xl p-12 text-center border border-neutral-200 dark:border-[#292929] space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 dark:text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-950 dark:text-[#F5F5F5]">
              {isEditMode ? 'Listing Updated Successfully!' : 'Listing Submitted for Review!'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8A8A8A] max-w-md mx-auto leading-relaxed">
              {isEditMode
                ? 'Your property changes have been saved and submitted for review. Redirecting to My Listings...'
                : 'Your property has been submitted to MakaoHub administration with status Pending Review. You will receive an instant notification once approved.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Details */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-[#262626]">
                <Building2 className="w-5 h-5 text-black dark:text-white" />
                <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">1. Basic Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Building / Property Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Greenview Apartments"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Property Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none cursor-pointer"
                    required
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                  Property Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe building amenities, proximity to roads/schools, security..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Section 2: Location Details with Interactive Pin Map */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-[#262626]">
                <MapPin className="w-5 h-5 text-black dark:text-white" />
                <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">2. Kenyan Location & Pin-Drop Map</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* County */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">County *</label>
                  <select
                    value={county}
                    onChange={(e) => handleCountyChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="" className="bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5]">Select County</option>
                    {counties.map((c) => (
                      <option key={c.code || c.name} value={c.name} className="bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-County */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">Sub-County *</label>
                  <select
                    value={subCounty}
                    onChange={(e) => handleSubCountyChange(e.target.value)}
                    disabled={!county || availableSubCounties.length === 0}
                    className="w-full px-3 py-2 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none cursor-pointer disabled:bg-neutral-100 dark:disabled:bg-[#151515] disabled:text-neutral-400 dark:disabled:text-[#666666]"
                    required
                  >
                    <option value="" className="bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5]">
                      {!county ? 'Select County First' : availableSubCounties.length === 0 ? 'No Sub-Counties' : 'Select Sub-County'}
                    </option>
                    {availableSubCounties.map((s) => (
                      <option key={s.code || s.name} value={s.name} className="bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5]">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">Ward *</label>
                  <select
                    value={ward}
                    onChange={(e) => handleWardChange(e.target.value)}
                    disabled={!subCounty || availableWards.length === 0}
                    className="w-full px-3 py-2 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none cursor-pointer disabled:bg-neutral-100 dark:disabled:bg-[#151515] disabled:text-neutral-400 dark:disabled:text-[#666666]"
                    required
                  >
                    <option value="" className="bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5]">
                      {!subCounty ? 'Select Sub-County First' : availableWards.length === 0 ? 'No Wards' : 'Select Ward'}
                    </option>
                    {availableWards.map((w) => (
                      <option key={w.code || w.name} value={w.name} className="bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5]">
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estate */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">Estate / Area *</label>
                  <input
                    type="text"
                    value={estate}
                    onChange={(e) => setEstate(e.target.value)}
                    placeholder="e.g. Seasons / Mirema / Kilimani"
                    className="w-full px-3 py-2 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                  Street Address / Notable Landmark
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Opposite Naivas Supermarket, Off Thika Road"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                />
              </div>

              {/* Pin-Drop Location Map */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-neutral-800 dark:text-[#F5F5F5]">
                    Interactive Building Pin-Drop Map
                  </label>
                  <span className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">
                    Click anywhere on the map to set exact coordinates
                  </span>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-[#292929] overflow-hidden">
                  <PropertyLocationPickerMap
                    county={county}
                    subCounty={subCounty}
                    ward={ward}
                    estate={estate}
                    selectedEstateName={
                      estate
                        ? `${estate}, ${ward || subCounty}`
                        : ward
                        ? `${ward}, ${subCounty}`
                        : subCounty
                        ? `${subCounty}, ${county}`
                        : county
                    }
                    lat={lat}
                    lng={lng}
                    onChange={(newLat, newLng) => {
                      setLat(newLat);
                      setLng(newLng);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Monthly Rent & Move-In Costs (KSh) */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-[#262626]">
                <DollarSign className="w-5 h-5 text-black dark:text-white" />
                <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">
                  3. Monthly Rent & Move-In Costs (KSh)
                </h2>
              </div>

              {/* Row 1: Monthly Rent, Security Deposit, Service Charge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Monthly Rent (KSh) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={monthlyRent}
                    onChange={handleNumericChange(setMonthlyRent)}
                    placeholder="e.g. 14000"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-base font-bold focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Security Deposit (KSh)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={deposit}
                    onChange={handleNumericChange(setDeposit)}
                    placeholder="e.g. 14000"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-base font-bold focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Service Charge (KSh/mo)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={serviceCharge}
                    onChange={handleNumericChange(setServiceCharge)}
                    placeholder="e.g. 1000"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-base font-bold focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Water Deposit, Electricity Deposit, Garbage Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-100 dark:border-[#262626]">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Water Deposit (KSh)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={waterDeposit}
                    onChange={handleNumericChange(setWaterDeposit)}
                    placeholder="e.g. 1500"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Electricity Deposit (KSh)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={electricityDeposit}
                    onChange={handleNumericChange(setElectricityDeposit)}
                    placeholder="e.g. 1500"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Garbage Fee (KSh/mo)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={garbageFee}
                    onChange={handleNumericChange(setGarbageFee)}
                    placeholder="e.g. 300"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Agency Fee, Viewing Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-[#262626]">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Agency Fee (KSh)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={agentFee}
                    onChange={handleNumericChange(setAgentFee)}
                    placeholder="Optional (defaults to 0)"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Viewing Fee (KSh)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={viewingFee}
                    onChange={handleNumericChange(setViewingFee)}
                    placeholder="Optional (defaults to 0)"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Availability & Units Breakdown */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-[#262626]">
                <Key className="w-5 h-5 text-black dark:text-white" />
                <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">4. Availability & Units Breakdown</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Vacant Units (Available) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={vacant}
                    onChange={handleNumericChange(setVacant)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] rounded-xl text-base font-bold focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none text-emerald-700 dark:text-emerald-400"
                    required
                  />
                  <p className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] mt-1">Ready for tenant move-in</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Occupied Units (Tenanted)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={occupied}
                    onChange={handleNumericChange(setOccupied)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-base font-bold focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">
                    Under Repair / Renovation
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={underRepair}
                    onChange={handleNumericChange(setUnderRepair)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-base font-bold focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Amenities Checkboxes */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-[#262626]">
                <CheckSquare className="w-5 h-5 text-black dark:text-white" />
                <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">5. Amenities & Facilities</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AMENITY_OPTIONS.map((item) => {
                  const isChecked = amenities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 ${
                        isChecked
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white shadow-2xs'
                          : 'bg-neutral-50 dark:bg-[#151515] hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] text-neutral-700 dark:text-[#CCCCCC] border-neutral-200 dark:border-[#292929]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isChecked
                            ? 'bg-white dark:bg-black text-black dark:text-white'
                            : 'border border-neutral-400 dark:border-[#555555] bg-white dark:bg-[#181818]'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 6: Property Photos */}
            <div
              id="property-photos-section"
              className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-neutral-100 dark:border-[#262626] gap-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-black dark:text-white" />
                  <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">
                    6. Property Photos <span className="text-red-500">*</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      images.length > 0
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                        : 'bg-neutral-100 dark:bg-[#181818] text-neutral-600 dark:text-[#A3A3A3]'
                    }`}
                  >
                    Property Photos ({images.length}/10)
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                Upload up to 10 photos of your property. Formats supported:{' '}
                <strong>JPG, JPEG, PNG, WebP</strong>. The first photo will automatically be used as
                the primary <strong>Cover Photo</strong>.
              </p>

              {/* Error Alert */}
              {photoError && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-red-950/40 border border-neutral-300 dark:border-red-900/60 flex items-start justify-between gap-3 text-xs text-neutral-900 dark:text-red-200 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-neutral-800 dark:text-red-400 shrink-0 mt-0.5" />
                    <span>{photoError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotoError(null)}
                    className="text-neutral-400 hover:text-black dark:hover:text-white font-bold text-sm leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
                id="property-photo-file-input"
              />

              {/* Upload Dropzone */}
              {images.length < 10 && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-black dark:border-white bg-neutral-100/90 dark:bg-[#1E1E1E] scale-[0.99]'
                      : 'border-neutral-300 dark:border-[#333333] hover:border-neutral-800 dark:hover:border-neutral-400 bg-neutral-50/60 dark:bg-[#151515]/60 hover:bg-neutral-50 dark:hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-[#292929] flex items-center justify-center shadow-xs text-neutral-800 dark:text-[#F5F5F5]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5]">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                        JPG, JPEG, PNG or WebP (max 10 photos)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Property Photos</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Empty state when 0 photos */}
              {images.length === 0 && (
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-[#292929] text-center">
                  <p className="text-xs font-medium text-neutral-600 dark:text-[#A3A3A3]">
                    No photos added yet. At least <strong>1 property photo</strong> is required to submit your listing.
                  </p>
                </div>
              )}

              {/* Thumbnails Grid */}
              {images.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-[#8A8A8A]">
                    <span className="font-semibold text-neutral-800 dark:text-[#F5F5F5]">
                      Selected Photos ({images.length}/10)
                    </span>
                    <span className="hidden sm:inline text-neutral-500 dark:text-[#8A8A8A]">
                      Tip: Click &apos;Set as Cover&apos; to change the main listing photo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {images.map((img, idx) => {
                      const isCover = idx === 0;
                      return (
                        <div
                          key={img}
                          className={`relative aspect-4/3 rounded-2xl overflow-hidden border group bg-neutral-100 dark:bg-[#181818] shadow-xs transition-all ${
                            isCover
                              ? 'border-2 border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10'
                              : 'border-neutral-200 dark:border-[#292929] hover:border-neutral-400 dark:hover:border-neutral-500'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Property Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Cover badge / Set as cover button */}
                          {isCover ? (
                            <div className="absolute top-2 left-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                              <Star className="w-3 h-3 fill-current text-inherit" />
                              <span>Cover Photo</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetCoverPhoto(idx);
                              }}
                              title="Set as Cover Photo"
                              className="absolute top-2 left-2 bg-white/95 dark:bg-black/90 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-800 dark:text-[#F5F5F5] text-[10px] font-bold px-2 py-1 rounded-lg border border-neutral-200 dark:border-[#333333] shadow-sm transition-all cursor-pointer flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                              <Star className="w-3 h-3" />
                              <span>Set as Cover</span>
                            </button>
                          )}

                          {/* Delete / Remove Action */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(idx);
                            }}
                            title="Remove photo"
                            className="absolute top-2 right-2 p-1.5 bg-white/95 dark:bg-black/90 hover:bg-red-600 hover:text-white text-neutral-700 dark:text-[#F5F5F5] rounded-lg border border-neutral-200 dark:border-[#333333] shadow-sm transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Photo Number Label */}
                          <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                            Photo {idx + 1}
                          </span>
                        </div>
                      );
                    })}

                    {/* Quick Add More Card in Grid if under 10 */}
                    {images.length < 10 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-4/3 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-[#333333] hover:border-black dark:hover:border-white bg-neutral-50 dark:bg-[#151515] hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] flex flex-col items-center justify-center gap-1 text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white transition-all cursor-pointer p-3 text-center"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-xs font-bold">Add More</span>
                        <span className="text-[10px] text-neutral-400 dark:text-[#7D7D7D] font-medium">
                          ({10 - images.length} slots left)
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section 7: Property Video (Optional) */}
            <div
              id="property-video-section"
              className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-neutral-100 dark:border-[#262626] gap-2">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-black dark:text-white" />
                  <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">
                    7. Property Video
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-neutral-100 dark:bg-[#181818] text-neutral-600 dark:text-[#A3A3A3]">
                    Optional
                  </span>
                  {videoUrl && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black">
                      1/1 Video Added
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                Add an optional video tour or walkthrough of your property. Supported formats:{' '}
                <strong>MP4, WebM</strong> (Max 1 video, up to 100 MB).
              </p>

              {/* Video Error Alert */}
              {videoError && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-red-950/40 border border-neutral-300 dark:border-red-900/60 flex items-start justify-between gap-3 text-xs text-neutral-900 dark:text-red-200 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-neutral-800 dark:text-red-400 shrink-0 mt-0.5" />
                    <span>{videoError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoError(null)}
                    className="text-neutral-400 hover:text-black dark:hover:text-white font-bold text-sm leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Hidden video file input */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm"
                onChange={(e) => handleVideoSelected(e.target.files)}
                className="hidden"
                id="property-video-file-input"
              />

              {/* If NO video selected: Upload Area */}
              {!videoUrl ? (
                <div
                  onDragOver={handleVideoDragOver}
                  onDragLeave={handleVideoDragLeave}
                  onDrop={handleVideoDrop}
                  onClick={() => videoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    isVideoDragging
                      ? 'border-black dark:border-white bg-neutral-100/90 dark:bg-[#1E1E1E] scale-[0.99]'
                      : 'border-neutral-300 dark:border-[#333333] hover:border-neutral-800 dark:hover:border-neutral-400 bg-neutral-50/60 dark:bg-[#151515]/60 hover:bg-neutral-50 dark:hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-[#292929] flex items-center justify-center shadow-xs text-neutral-800 dark:text-[#F5F5F5]">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5]">
                        Click to upload property video or drag and drop
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                        MP4 or WebM (max 100 MB, 1 video per listing)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        videoInputRef.current?.click();
                      }}
                      className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Property Video</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* If video IS selected: Video Preview Card */
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Video Player */}
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-neutral-200 dark:border-[#292929] aspect-video max-h-96 w-full flex items-center justify-center shadow-xs">
                    <video
                      src={videoUrl}
                      controls
                      autoPlay={false}
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* File Details & Action Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-neutral-50 dark:bg-[#151515] rounded-2xl border border-neutral-200 dark:border-[#292929]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-[#292929] flex items-center justify-center shrink-0 text-neutral-800 dark:text-[#F5F5F5]">
                        <FileVideo className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 dark:text-[#F5F5F5] truncate max-w-[220px] sm:max-w-md">
                          {videoFile?.name || 'Property Walkthrough Video'}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] mt-0.5">
                          {videoFile?.size ? formatVideoSize(videoFile.size) : 'Ready to submit'} • MP4/WebM Video
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="px-3.5 py-2 bg-white dark:bg-[#181818] hover:bg-neutral-100 dark:hover:bg-[#222222] text-neutral-800 dark:text-[#F5F5F5] text-xs font-bold rounded-xl border border-neutral-300 dark:border-[#333333] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="px-3.5 py-2 bg-white dark:bg-[#181818] hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-neutral-200 dark:border-[#333333] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Video</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelOrBack}
                className="px-6 py-3 text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-bold rounded-2xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer ${
                  isSubmitting ? 'opacity-80 cursor-wait' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>{uploadProgressText || 'Uploading to Storage...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>{isEditMode ? 'Save Changes' : 'Submit Listing for Approval'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
