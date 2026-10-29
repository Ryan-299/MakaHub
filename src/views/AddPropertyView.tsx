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
  ImagePlus,
  CheckCircle2,
  Sparkles,
  Trash2,
  Star,
  Plus,
  AlertCircle,
  Video,
  FileVideo,
  RefreshCw,
  ChevronDown
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
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const PROPERTY_TYPES: PropertyType[] = [
  'Single Room',
  'Double Room',
  'Bedsitter',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4+ Bedroom',
  'Studio',
  'Commercial / Shop'
];

const AMENITY_OPTIONS = [
  'Borehole Water / 24/7 Supply',
  'Electricity (Prepaid)',
  'Electricity (Postpaid)',
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
    currentUser,
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

  const [name, setName] = useState(() => editingProperty?.name || '');

  const [type, setType] = useState<PropertyType>(() => editingProperty?.type || '1 Bedroom');
  const [propertyTypeDropdownOpen, setPropertyTypeDropdownOpen] = useState(false);
  const [countyDropdownOpen, setCountyDropdownOpen] = useState(false);
  const [subCountyDropdownOpen, setSubCountyDropdownOpen] = useState(false);
  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);
  const [selectedUnitTypes, setSelectedUnitTypes] = useState<PropertyType[]>(
    () => editingProperty?.type ? [editingProperty.type] : []
  );

  const [description, setDescription] = useState(
    () => editingProperty?.description || ''
  );

  // Contact number for this specific property
  const [contactPhone, setContactPhone] = useState(
    () => editingProperty?.lister?.phone || ''
  );


  // 2. Location Details
  const [county, setCounty] = useState(() => editingProperty?.location?.county || 'Nairobi');
  const [subCounty, setSubCounty] = useState(() => editingProperty?.location?.subCounty || 'Kasarani');
  const [ward, setWard] = useState(() => editingProperty?.location?.ward || 'Clay City');
  const [estate, setEstate] = useState(() => editingProperty?.location?.estate || '');

  const [address, setAddress] = useState(
    () => editingProperty?.location?.address || ''
  );

  const [lat, setLat] = useState<number | null>(() => editingProperty?.location?.lat ?? null);
  const [lng, setLng] = useState<number | null>(() => editingProperty?.location?.lng ?? null);

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
  const [agentFee, setAgentFee] = useState<string>(() =>
    editingProperty?.agentFee ? String(editingProperty.agentFee) : ''
  );
  const [viewingFee, setViewingFee] = useState<string>(() =>
    editingProperty?.viewingFee ? String(editingProperty.viewingFee) : ''
  );

  // Mixed Units: independent pricing and availability for each unit type.
  // Existing single-unit states remain unchanged.
  type UnitDetails = {
    monthlyRent: string;
    deposit: string;
    serviceCharge: string;
    waterDeposit: string;
    electricityDeposit: string;
    agentFee: string;
    viewingFee: string;
    vacancies: string;
    occupied: string;
    underRepair: string;
  };

  const [mixedUnitDetails, setMixedUnitDetails] = useState<
    Record<string, UnitDetails>
  >({});

  const [activeUnitType, setActiveUnitType] = useState<string>('');

  const createEmptyUnitDetails = (): UnitDetails => ({
    monthlyRent: '',
    deposit: '',
    serviceCharge: '',
    waterDeposit: '',
    electricityDeposit: '',
    agentFee: '',
    viewingFee: '',
    vacancies: '',
    occupied: '',
    underRepair: ''
  });

  const updateMixedUnitDetail = (
    unitType: string,
    field: keyof UnitDetails,
    value: string
  ) => {
    setMixedUnitDetails((previous) => ({
      ...previous,
      [unitType]: {
        ...(previous[unitType] ?? createEmptyUnitDetails()),
        [field]: value
      }
    }));
  };

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

  type UnitMedia = {
    images: string[];
    photoFiles: (File | null)[];
    videoUrl: string | null;
    videoFile: File | null;
  };

  const createEmptyUnitMedia = (): UnitMedia => ({
    images: [],
    photoFiles: [],
    videoUrl: null,
    videoFile: null
  });

  const [mixedUnitMedia, setMixedUnitMedia] = useState<
    Record<string, UnitMedia>
  >({});

  // Existing unit photographs are managed separately from the building cover.
  // This applies only when editing an existing single-unit property.
  type EditableUnitPhoto = {
    url: string;
    storageId?: Id<'_storage'>;
    file?: File;
  };

  const [editUnitId, setEditUnitId] = useState<Id<'propertyUnitTypes'> | null>(null);
  const [editUnitPhotos, setEditUnitPhotos] = useState<EditableUnitPhoto[]>([]);
  const [editUnitStatus, setEditUnitStatus] = useState<
    'loading' | 'ready' | 'none' | 'legacy' | 'error'
  >('none');
  const [editUnitPhotoError, setEditUnitPhotoError] = useState<string | null>(null);
  const [editUnitDirty, setEditUnitDirty] = useState(false);

  const maxBuildingPhotos =
    !isEditMode || editUnitStatus === 'ready' ? 1 : 10;

  useEffect(() => {
    let active = true;

    setEditUnitId(null);
    setEditUnitPhotos([]);
    setEditUnitDirty(false);
    setEditUnitPhotoError(null);

    if (!isEditMode || !editingProperty || editingProperty.type === 'Mixed Units') {
      setEditUnitStatus('none');
      return () => { active = false; };
    }

    if (!isConvexConfigured || !convexClient) {
      setEditUnitStatus('error');
      setEditUnitPhotoError('Unable to connect to Convex to load unit photographs.');
      return () => { active = false; };
    }

    setEditUnitStatus('loading');

    void convexClient.query(api.propertyUnitTypes.getByProperty, {
      propertyId: editingProperty.id as Id<'properties'>,
    }).then((units) => {
      if (!active) return;

      if (units.length === 0) {
        setEditUnitStatus('none');
        return;
      }

      if (units.length !== 1) {
        setEditUnitStatus('error');
        setEditUnitPhotoError('This property contains multiple units.');
        return;
      }

      const unit = units[0];
      const ids = unit.imageStorageIds ?? [];
      const urls = unit.resolvedImages ?? [];

      if (ids.length === 0 || ids.length !== urls.length) {
        setEditUnitStatus('legacy');
        setEditUnitPhotoError(
          'Some photographs cannot be matched to their storage records. No photo changes will be made.'
        );
        return;
      }

      setEditUnitId(unit._id);
      setEditUnitPhotos(
        urls.map((url, index) => ({
          url,
          storageId: ids[index],
        }))
      );
      setEditUnitStatus('ready');
    }).catch((error) => {
      if (!active) return;

      console.error('Unable to load unit photos:', error);
      setEditUnitStatus('error');
      setEditUnitPhotoError('Unable to load existing unit photographs.');
    });

    return () => { active = false; };
  }, [isEditMode, editingProperty?.id, editingProperty?.type]);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isSubmittedRef = useRef(false);
  const createdPropertyIdRef = useRef<string | null>(null);

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
      setContactPhone(editingProperty.lister?.phone || '');
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
      setPhotoFiles((editingProperty.images || []).map(() => null));

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



    const maxPhotos = maxBuildingPhotos;

    const remainingSlots = maxPhotos - images.length;

    if (remainingSlots <= 0) {
      setPhotoError(
        `Maximum of ${maxPhotos} photo${maxPhotos === 1 ? '' : 's'} allowed.`
      );
      return;
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      setPhotoError(
        `Only ${remainingSlots} photo${remainingSlots === 1 ? '' : 's'} added. Maximum ${maxPhotos} allowed.`
      );
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

  const handleMixedUnitPhotosSelected = (
    unitType: string,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    const validFiles = Array.from(files).filter((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return allowedTypes.includes(file.type.toLowerCase()) ||
        ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
    });

    if (validFiles.length === 0) {
      setPhotoError('Please select JPG, JPEG, PNG or WebP images.');
      return;
    }

    const existing = mixedUnitMedia[unitType] ?? createEmptyUnitMedia();
    const remainingSlots = 10 - existing.images.length;

    if (remainingSlots <= 0) {
      setPhotoError(`Maximum 10 photos allowed for ${unitType}.`);
      return;
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newUrls = filesToAdd.map((file) => {
      const url = URL.createObjectURL(file);
      createdObjectUrlsRef.current.add(url);
      return url;
    });

    setMixedUnitMedia((previous) => {
      const current = previous[unitType] ?? createEmptyUnitMedia();

      return {
        ...previous,
        [unitType]: {
          ...current,
          images: [...current.images, ...newUrls],
          photoFiles: [...current.photoFiles, ...filesToAdd]
        }
      };
    });

    setPhotoError(null);
  };

  const handleRemoveMixedUnitPhoto = (
    unitType: string,
    indexToRemove: number
  ) => {
    const current = mixedUnitMedia[unitType];
    if (!current) return;

    const urlToRemove = current.images[indexToRemove];
    if (!urlToRemove) return;

    if (createdObjectUrlsRef.current.has(urlToRemove)) {
      URL.revokeObjectURL(urlToRemove);
      createdObjectUrlsRef.current.delete(urlToRemove);
    }

    setMixedUnitMedia((previous) => {
      const existing = previous[unitType];
      if (!existing) return previous;

      return {
        ...previous,
        [unitType]: {
          ...existing,
          images: existing.images.filter(
            (_, index) => index !== indexToRemove
          ),
          photoFiles: existing.photoFiles.filter(
            (_, index) => index !== indexToRemove
          )
        }
      };
    });
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

  // Edit Listing: add new unit photographs.
  const handleEditUnitPhotosSelected = (files: FileList | null) => {
    if (!files || files.length === 0 || editUnitStatus !== 'ready') return;

    const validFiles = Array.from(files).filter((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      return (
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type.toLowerCase()) ||
        ['jpg', 'jpeg', 'png', 'webp'].includes(extension)
      );
    });

    if (validFiles.length === 0) {
      setEditUnitPhotoError('Please select JPG, JPEG, PNG or WebP photographs.');
      return;
    }

    const remainingSlots = 10 - editUnitPhotos.length;

    if (remainingSlots <= 0) {
      setEditUnitPhotoError('Maximum 10 unit photographs allowed.');
      return;
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newPhotos: EditableUnitPhoto[] = filesToAdd.map((file) => {
      const url = URL.createObjectURL(file);
      createdObjectUrlsRef.current.add(url);
      return { url, file };
    });

    setEditUnitPhotos((previous) => [...previous, ...newPhotos]);
    setEditUnitDirty(true);
    setEditUnitPhotoError(null);
  };

  // Edit Listing: remove a unit photograph.
  const handleRemoveEditUnitPhoto = (indexToRemove: number) => {
    if (editUnitStatus !== 'ready') return;

    const photo = editUnitPhotos[indexToRemove];
    if (!photo) return;

    if (createdObjectUrlsRef.current.has(photo.url)) {
      revokeTemporaryMedia(photo.url);
      createdObjectUrlsRef.current.delete(photo.url);
    }

    setEditUnitPhotos((previous) =>
      previous.filter((_, index) => index !== indexToRemove)
    );

    setEditUnitDirty(true);
    setEditUnitPhotoError(null);
  };

  // Edit Listing: change the unit's cover photograph.
  const handleSetEditUnitCover = (indexToMakeCover: number) => {
    if (editUnitStatus !== 'ready' || indexToMakeCover === 0) return;
    if (!editUnitPhotos[indexToMakeCover]) return;

    setEditUnitPhotos((previous) => {
      const selected = previous[indexToMakeCover];
      const remaining = previous.filter(
        (_, index) => index !== indexToMakeCover
      );

      return [selected, ...remaining];
    });

    setEditUnitDirty(true);
    setEditUnitPhotoError(null);
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

  const handleMixedUnitVideoSelected = (
    unitType: string,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (
      !['mp4', 'webm'].includes(ext) ||
      !['video/mp4', 'video/webm'].includes(file.type.toLowerCase())
    ) {
      setVideoError('Please select an MP4 or WebM video.');
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setVideoError('Video exceeds the 100 MB limit.');
      return;
    }

    const previousUrl = mixedUnitMedia[unitType]?.videoUrl;

    if (previousUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previousUrl);
      createdObjectUrlsRef.current.delete(previousUrl);
    }

    const newUrl = URL.createObjectURL(file);
    createdObjectUrlsRef.current.add(newUrl);

    setMixedUnitMedia((previous) => ({
      ...previous,
      [unitType]: {
        ...(previous[unitType] ?? createEmptyUnitMedia()),
        videoUrl: newUrl,
        videoFile: file
      }
    }));

    setVideoError(null);
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
    const electricityOptions = [
      'Electricity (Prepaid)',
      'Electricity (Postpaid)'
    ];

    setAmenities((previous) => {
      // Electricity options are mutually exclusive.
      if (electricityOptions.includes(item)) {
        return [
          ...previous.filter(
            (amenity) => !electricityOptions.includes(amenity)
          ),
          item
        ];
      }

      // Other amenities retain their normal checkbox behaviour.
      return previous.includes(item)
        ? previous.filter((amenity) => amenity !== item)
        : [...previous, item];
    });
  };





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (selectedUnitTypes.length === 0) {
      setPhotoError('Please select a property type.');
      return;
    }

    if (
      typeof lat !== 'number' ||
      !Number.isFinite(lat) ||
      typeof lng !== 'number' ||
      !Number.isFinite(lng)
    ) {
      window.alert(
        'Please set the exact building location on the map before submitting your property.'
      );

      document.getElementById('property-location-map')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      return;
    }


    // Save Mixed Units separately from the existing single-unit flow.
    if (!isEditMode && selectedUnitTypes.length >= 1) {
      const isSingleUnitSubmission = selectedUnitTypes.length === 1;

      if (isEditMode) {
        setPhotoError(
          'Editing Mixed Units is not enabled yet. No changes were saved.'
        );
        return;
      }

      if (!isConvexConfigured || !convexClient || !currentUser?.id) {
        setPhotoError(
          'Please sign in and connect to Convex before submitting Mixed Units.'
        );
        return;
      }
      if (images.length !== 1 || !photoFiles[0]) {
        setPhotoError('Add exactly one new building cover photo.');
        return;
      }

      if (!name.trim() || !county || !subCounty || !ward || !estate.trim()) {
        setPhotoError('Complete the building name and location.');
        return;
      }



      setIsSubmitting(true);
      setPhotoError(null);

      try {
        setUploadProgressText('Uploading building cover...');
        const buildingCoverId = (await uploadFileToConvex(photoFiles[0])) as Id<'_storage'>;

        const unitTypes = [];

        // Process all selected property types using the existing Mixed Units loop.
        for (const unitType of selectedUnitTypes) {
          const details = mixedUnitDetails[unitType];
          const media = mixedUnitMedia[unitType];

          setUploadProgressText(`Uploading ${unitType} media...`);

          const imageIds: Id<'_storage'>[] = [];

          for (const file of media.photoFiles) {
            if (!file) {
              throw new Error(`Missing original image for ${unitType}.`);
            }

            const storageId = await uploadFileToConvex(file);
            imageIds.push(storageId as Id<'_storage'>);
          }

          const videoId = media.videoFile
            ? await uploadFileToConvex(media.videoFile)
            : undefined;

          const numberValue = (value: string): number =>
            value.trim() === '' ? 0 : Number(value);

          unitTypes.push({
            type: unitType,
            monthlyRent: numberValue(details.monthlyRent),
            deposit: numberValue(details.deposit),
            serviceCharge: numberValue(details.serviceCharge),
            waterDeposit: numberValue(details.waterDeposit),
            electricityDeposit: numberValue(details.electricityDeposit),
            agentFee: numberValue(details.agentFee),
            viewingFee: numberValue(details.viewingFee),
            vacancies: numberValue(details.vacancies),
            occupied: numberValue(details.occupied),
            underRepair: numberValue(details.underRepair),
            amenities: [...amenities],
            images: [] as string[],
            imageStorageIds: imageIds,
            coverPhotoStorageId: imageIds[0],
            videoStorageId: videoId
              ? (videoId as Id<'_storage'>)
              : undefined,
            videoName: media.videoFile?.name,
            videoSize: media.videoFile?.size,
          });
        }

        const values = unitTypes.flatMap((unit) => [
          unit.monthlyRent,
          unit.deposit,
          unit.serviceCharge,
          unit.waterDeposit,
          unit.electricityDeposit,
          unit.agentFee,
          unit.viewingFee,
          unit.vacancies,
          unit.occupied,
          unit.underRepair,
        ]);

        if (
          values.some((value) => !Number.isFinite(value) || value < 0) ||
          unitTypes.some(
            (unit) =>
              !Number.isSafeInteger(unit.vacancies) ||
              !Number.isSafeInteger(unit.occupied) ||
              !Number.isSafeInteger(unit.underRepair)
          )
        ) {
          throw new Error(
            'Prices and availability must be valid non-negative numbers.'
          );
        }

        setUploadProgressText('Saving building and unit types...');

        await convexClient.mutation(api.properties.addWithUnits, {
          name: name.trim(),
          type: isSingleUnitSubmission ? selectedUnitTypes[0] : 'Mixed Units',
          description,
          location: {
            county,
            subCounty,
            ward,
            estate,
            address: address || undefined,
            lat,
            lng,
            distanceMock: 1.2,
          },
          monthlyRent: Math.min(
            ...unitTypes.map((unit) => unit.monthlyRent)
          ),
          deposit: Math.min(
            ...unitTypes.map((unit) => unit.deposit)
          ),
          serviceCharge: isSingleUnitSubmission ? unitTypes[0].serviceCharge : 0,
          agentFee: isSingleUnitSubmission ? unitTypes[0].agentFee : 0,
          viewingFee: isSingleUnitSubmission ? unitTypes[0].viewingFee : 0,
          waterDeposit: isSingleUnitSubmission ? unitTypes[0].waterDeposit : 0,
          electricityDeposit: isSingleUnitSubmission ? unitTypes[0].electricityDeposit : 0,
          garbageFee: 0,
          otherFees: 0,
          vacancies: unitTypes.reduce(
            (total, unit) => total + unit.vacancies,
            0
          ),
          occupied: unitTypes.reduce(
            (total, unit) => total + unit.occupied,
            0
          ),
          underRepair: unitTypes.reduce(
            (total, unit) => total + unit.underRepair,
            0
          ),
          amenities: [...amenities],
          images: [],
          imageStorageIds: [
            buildingCoverId as Id<'_storage'>,
          ],
          coverPhotoStorageId: buildingCoverId as Id<'_storage'>,
          rating: 0,
          reviewCount: 0,
          timePosted: 'Just now',
          createdAt: new Date().toISOString(),
          status: 'Pending',
          lister: {
            id: currentUser.id,
            name: currentUser.name || 'Lister',
            type: 'Landlord / Property Owner',
            avatar: currentUser.avatar || '',
            phone: contactPhone.trim().startsWith('0')
              ? `+254${contactPhone.trim().slice(1)}`
              : contactPhone.trim(),
            email: currentUser.email || undefined,
            verified: true,
          },
          viewsCount: 0,
          enquiriesCount: 0,
          unitTypes,
        });

        isSubmittedRef.current = true;
        setSubmitted(true);

        setTimeout(() => {
          setCurrentView('my-listings');
        }, 1800);
      } catch (error) {
        console.error('Property submission failed:', error);

        setPhotoError(
          error instanceof Error
            ? error.message
            : 'Unable to save property. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
        setUploadProgressText('');
      }

      return;
    }



    const hasPropertyPhotos = images.length > 0;


    const hasMixedUnitPhotos =
      selectedUnitTypes.length > 1 &&
      selectedUnitTypes.every(
        (unitType) => (mixedUnitMedia[unitType]?.images.length ?? 0) > 0
      );

    if (!hasPropertyPhotos && !hasMixedUnitPhotos) {
      setPhotoError(
        'Please add at least one property photo before submitting your listing.'
      );

      const photoSection = document.getElementById('property-photos-section');

      if (photoSection) {
        photoSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
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
            setUploadProgressText('Uploading...');
            const storageId = await uploadFileToConvex(file);
            imageStorageIds.push(storageId);
          }
        }
      }

      // 2. Upload video tour file to Convex storage if provided
      let videoStorageId: string | undefined = undefined;
      if (videoFile && isConvexConfigured && convexClient) {
        setUploadProgressText('Uploading...');
        videoStorageId = await uploadFileToConvex(videoFile);
      }

      const coverPhotoStorageId = imageStorageIds.length > 0 ? imageStorageIds[0] : undefined;


      const submittedImages = [...images];
      const coverPhoto = submittedImages[0] || '';



      // Parse all numeric values (empty string converts to 0)
      const parsedMonthlyRent = monthlyRent.trim() !== '' ? Number(monthlyRent) : 0;
      const parsedDeposit = deposit.trim() !== '' ? Number(deposit) : 0;
      const parsedServiceCharge = serviceCharge.trim() !== '' ? Number(serviceCharge) : 0;
      const parsedWaterDeposit = waterDeposit.trim() !== '' ? Number(waterDeposit) : 0;
      const parsedElectricityDeposit = electricityDeposit.trim() !== '' ? Number(electricityDeposit) : 0;
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
          lister: {
            ...editingProperty.lister,
            phone: contactPhone.trim(),
          },
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
          videoSize: videoFile?.size || editingProperty.videoSize,

          status:
            editingProperty.status === 'Rejected'
              ? 'Pending'
              : editingProperty.status,
        });

        // Save existing unit photo changes separately from the building cover.
        if (editUnitDirty) {
          if (editUnitStatus !== 'ready' || !editUnitId || !convexClient) {
            throw new Error('Unit photographs are not ready to be updated.');
          }

          if (editUnitPhotos.length === 0) {
            throw new Error('Keep at least one unit photograph.');
          }

          const updatedUnitImageIds: Id<'_storage'>[] = [];

          for (const photo of editUnitPhotos) {
            if (photo.file) {
              setUploadProgressText('Uploading updated unit photographs...');
              const storageId = await uploadFileToConvex(photo.file);
              updatedUnitImageIds.push(storageId as Id<'_storage'>);
            } else if (photo.storageId) {
              updatedUnitImageIds.push(photo.storageId);
            } else {
              throw new Error('An existing unit photo has no storage reference.');
            }
          }

          setUploadProgressText('Saving unit photographs...');

          await convexClient.mutation(api.propertyUnitTypes.updateUnitType, {
            id: editUnitId,
            images: [],
            imageStorageIds: updatedUnitImageIds,
            coverPhotoStorageId: updatedUnitImageIds[0],
          });

          setEditUnitDirty(false);
        }

        setEditingPropertyId(null);

      } else {
        const createdPropertyId = createdPropertyIdRef.current ?? await addPropertyListing({
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
          agentFee: parsedAgentFee,
          viewingFee: parsedViewingFee,
          vacancies: parsedVacant,
          occupied: parsedOccupied,
          underRepair: parsedUnderRepair,
          amenities: [...amenities],
          images: [],
          coverPhoto: '',
          imageStorageIds: imageStorageIds.length > 0 ? imageStorageIds : undefined,
          coverPhotoStorageId,
          videoStorageId,

          video: undefined,
          videoName: videoFile?.name,
          videoSize: videoFile?.size,
          lister: {
            id: currentUser?.id || '',
            name: currentUser?.name || 'Lister',
            type: currentUser?.listerSubtype || 'Landlord / Property Owner',
            avatar: currentUser?.avatar || '',
            phone: contactPhone.trim().startsWith('0')
              ? `+254${contactPhone.trim().slice(1)}`
              : contactPhone.trim(),
            email: currentUser?.email || '',
            verified: true,
          }

        });
        createdPropertyIdRef.current = createdPropertyId;
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

    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] dark:bg-[#0D0D0D] pb-24 text-[#242424] dark:text-[#F5F1E8] font-manrope transition-colors duration-200">

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">


        {/* Rentike Header */}
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-[#E5D6C5] dark:border-[#262626]">

          <div className="flex items-center gap-3 min-w-0">

            {/* Desktop and tablet back button */}
            <button
              type="button"
              onClick={handleCancelOrBack}
              aria-label="Go back"
              className="
            hidden md:flex
            shrink-0 items-center justify-center
            w-10 h-10 rounded-xl
            bg-[#F7F3EC] dark:bg-[#202020]
            border border-[#E2D3C2] dark:border-[#38322D]
            text-[#946B46] dark:text-[#C49A6C]
            shadow-[3px_3px_7px_rgba(0,0,0,0.08),-2px_-2px_6px_rgba(255,255,255,0.8)]
            dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45)]
            hover:border-[#C49A6C]
            active:scale-[0.97]
            transition-all cursor-pointer
          "
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <h1 className="font-editorial text-[30px] sm:text-[38px] lg:text-[42px] font-semibold leading-tight tracking-tight">
                {isEditMode ? (
                  <>
                    <span className="text-[#242424] dark:text-[#F5F1E8]">Edit </span>
                    <span className="text-[#946B46] dark:text-[#C49A6C]">Listing</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#242424] dark:text-[#F5F1E8]">Add </span>
                    <span className="text-[#946B46] dark:text-[#C49A6C]">New Listing</span>
                  </>
                )}
              </h1>

              <p className="mt-1 text-[11px] sm:text-sm leading-relaxed text-[#77716C] dark:text-[#A3A3A3]">
                {isEditMode
                  ? 'Update your property details, pricing, location and photos.'
                  : 'Tell us about your property and make it ready for review.'}
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
                ? 'Your property changes have been saved successfully and are now live. Redirecting to My Listings...'
                : 'Your property has been submitted to MakaoHub administration with status Pending Review. You will receive an instant notification once approved.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">


            {/* Property type */}
            <div>
              <label
                id="property-type-label"
                className="block text-lg font-bold text-[#242424] dark:text-[#F5F1E8] mb-3"
              >
                1. Property Type <span className="text-[#B4534C]">*</span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  aria-labelledby="property-type-label"
                  aria-haspopup="listbox"
                  aria-expanded={propertyTypeDropdownOpen}
                  onClick={() => setPropertyTypeDropdownOpen((open) => !open)}
                  className="
        w-full min-w-0
        flex items-center justify-between gap-2
        px-3.5 py-3
        rounded-xl
        bg-[#F7F3EC] dark:bg-[#151515]
        border border-[#E2D3C2] dark:border-[#40362E]
        text-[#242424] dark:text-[#F5F1E8]
        text-sm font-medium text-left
        shadow-[inset_2px_2px_5px_rgba(104,73,43,0.06)]
        dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35)]
        hover:border-[#C49A6C]
        focus:outline-none
        focus:ring-2 focus:ring-[#C49A6C]/20
        transition-all cursor-pointer
      "
                >
                  <span className="truncate">

                    {selectedUnitTypes.length === 0
                      ? 'Select Property Type'
                      : selectedUnitTypes.length === 1
                        ? selectedUnitTypes[0]
                        : `${selectedUnitTypes[0]} + ${selectedUnitTypes.length - 1} more`}

                  </span>

                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-[#946B46] dark:text-[#C49A6C] transition-transform duration-200 ${propertyTypeDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {propertyTypeDropdownOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="property-type-label"
                    className="
          absolute left-0 right-0
          top-[calc(100%+8px)]
          z-50
          max-h-64 overflow-y-auto
          rounded-2xl
          border border-[#E4D8C8] dark:border-[#38322D]
          bg-[#FBF7F1] dark:bg-[#181818]
          shadow-[0_14px_35px_rgba(0,0,0,0.16)]
          dark:shadow-[0_14px_35px_rgba(0,0,0,0.55)]
          py-1
        "
                  >

                    <div className="px-3 py-2 text-[11px] font-medium text-[#946B46] dark:text-[#C49A6C] border-b border-[#E2D3C2] dark:border-[#40362E]">
                      Select all that apply to this building
                    </div>
                    {PROPERTY_TYPES.map((t) => {
                      const isSelected = selectedUnitTypes.includes(t);

                      return (
                        <button
                          key={t}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {


                            const next = isSelected
                              ? selectedUnitTypes.filter((item) => item !== t)
                              : [...selectedUnitTypes, t];

                            // Preserve the final selection once one has been chosen.
                            if (next.length === 0) return;

                            setSelectedUnitTypes(next);

                            // Preserve compatibility with existing single-unit listings.
                            setType(next[0]);

                            // Keep the active pricing tab aligned with selected unit types.
                            setActiveUnitType((current) =>
                              next.includes(current as PropertyType)
                                ? current
                                : next[0]
                            );

                            // Prepare pricing and availability for newly selected unit types.
                            // Preserve existing entries when switching selections.
                            setMixedUnitDetails((previous) => {
                              const updated = { ...previous };

                              next.forEach((unitType) => {
                                if (!updated[unitType]) {
                                  updated[unitType] = createEmptyUnitDetails();
                                }
                              });

                              return updated;
                            });
                          }}

                          className={`
        w-full flex items-center gap-3
        px-4 py-3 text-left text-sm
        transition-colors cursor-pointer
        ${isSelected
                              ? 'bg-[#EAD7BF] dark:bg-[#493525] text-[#9A5E1F] dark:text-[#E8BE92] font-semibold'
                              : 'text-neutral-800 dark:text-neutral-100 hover:bg-[#F2E7D8] dark:hover:bg-[#24201C]'
                            }
      `}
                        >
                          <span
                            className={`
          w-5 h-5 shrink-0 rounded-md
          flex items-center justify-center
          border-2 text-xs font-bold
          ${isSelected
                                ? 'bg-[#C49A6C] border-[#C49A6C] text-white'
                                : 'bg-[#F7F3EC] dark:bg-[#202020] border-[#D8C5AE] dark:border-[#66513E]'
                              }
        `}
                          >
                            {isSelected ? '✓' : ''}
                          </span>

                          <span>{t}</span>
                        </button>
                      );
                    })}

                    {/* Confirm selected unit types */}
                    <div className="p-2.5 bg-[#F7F3EC] dark:bg-[#181818] border-t border-[#E2D3C2] dark:border-[#40362E]">
                      <button
                        type="button"
                        onClick={() => setPropertyTypeDropdownOpen(false)}
                        className="
      w-full flex items-center justify-center gap-2
      px-4 py-2.5 rounded-xl
      bg-[#C49A6C] hover:bg-[#B58959]
      text-white text-xs font-bold
      shadow-[3px_3px_8px_rgba(0,0,0,0.15)]
      dark:shadow-[3px_3px_8px_rgba(0,0,0,0.5)]
      active:scale-[0.98]
      transition-all duration-200
      cursor-pointer
    "
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Done ({selectedUnitTypes.length} selected)
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>


            {/* Property Name and Description */}
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="property-name"
                  className="block text-lg font-bold text-[#242424] dark:text-[#F5F1E8] mb-3"
                >
                  2. Property Name <span className="text-[#B4534C]">*</span>
                </label>
                <input
                  id="property-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter property name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#F7F3EC] dark:bg-[#151515] text-[#242424] dark:text-[#F5F1E8] border border-[#E2D3C2] dark:border-[#40362E] focus:outline-none focus:ring-2 focus:ring-[#C49A6C]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="property-description"
                  className="block text-lg font-bold text-[#242424] dark:text-[#F5F1E8] mb-3"
                >
                  3. Property Description
                </label>
                <textarea
                  id="property-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your property..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-[#F7F3EC] dark:bg-[#151515] text-[#242424] dark:text-[#F5F1E8] border border-[#E2D3C2] dark:border-[#40362E] focus:outline-none focus:ring-2 focus:ring-[#C49A6C]/30 resize-y"
                />
              </div>
            </div>



            {/* Section 2: Property Location */}
            <div className="space-y-3">

              {/* Heading outside the neumorphic card */}
              <div className="flex items-center gap-2">

                <h2 className="text-lg font-bold text-[#242424] dark:text-[#F5F1E8]">
                  4. Property Location
                  <span className="ml-1 text-[#B4534C] text-[#B4534C]">*</span>
                </h2>
              </div>

              {/* Neumorphic location card */}
              <div
                className="
      rounded-2xl
      p-4 sm:p-6
      space-y-5
      bg-[#F7F3EC] dark:bg-[#181818]
      border border-[#E2D3C2] dark:border-[#40362E]
      shadow-[4px_4px_12px_rgba(104,73,43,0.10),-3px_-3px_10px_rgba(255,255,255,0.85)]
      dark:shadow-[5px_5px_14px_rgba(0,0,0,0.55),-2px_-2px_8px_rgba(255,255,255,0.025)]
    "
              >

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* County */}
                  <div className="relative">
                    <label
                      id="county-label"
                      className="block text-xs font-bold text-[#66513F] dark:text-[#D4C2B0] mb-1.5"
                    >
                      County *
                    </label>

                    <button
                      type="button"
                      aria-labelledby="county-label"
                      aria-haspopup="listbox"
                      aria-expanded={countyDropdownOpen}
                      onClick={() => setCountyDropdownOpen((open) => !open)}
                      className="
      w-full flex items-center justify-between gap-2
      px-3.5 py-3 rounded-xl
      bg-[#F7F3EC] dark:bg-[#151515]
      text-[#242424] dark:text-[#F5F1E8]
      border border-[#E2D3C2] dark:border-[#40362E]
      shadow-[inset_2px_2px_5px_rgba(104,73,43,0.06)]
      dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35)]
      text-xs font-medium text-left
      focus:outline-none focus:ring-2 focus:ring-[#C49A6C]/30
      transition-all cursor-pointer
    "
                    >
                      <span className="truncate">
                        {county || 'Select County'}
                      </span>

                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-[#946B46] dark:text-[#C49A6C] transition-transform duration-200 ${countyDropdownOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {countyDropdownOpen && (
                      <div
                        role="listbox"
                        aria-labelledby="county-label"
                        className="
        absolute left-0 right-0 top-[calc(100%+6px)]
        z-50 max-h-56 overflow-y-auto
        rounded-xl
        bg-[#F7F3EC] dark:bg-[#181818]
        border border-[#E2D3C2] dark:border-[#40362E]
        shadow-[0_12px_30px_rgba(0,0,0,0.16)]
        dark:shadow-[0_14px_35px_rgba(0,0,0,0.55)]
      "
                      >
                        {counties.map((c) => {
                          const isSelected = county === c.name;

                          return (
                            <button
                              key={c.code || c.name}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                handleCountyChange(c.name);
                                setCountyDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left text-xs transition-colors cursor-pointer ${isSelected
                                ? 'bg-[#EAD7BF] dark:bg-[#493525] text-[#946B46] dark:text-[#E8BE92] font-bold'
                                : 'text-[#242424] dark:text-[#F5F1E8] hover:bg-[#F0E5D8] dark:hover:bg-[#24201C]'
                                }`}
                            >
                              <span>{c.name}</span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C49A6C]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>


                  {/* Sub-County */}
                  <div className="relative">
                    <label
                      id="subcounty-label"
                      className="block text-xs font-bold text-[#66513F] dark:text-[#D4C2B0] mb-1.5"
                    >
                      Sub-County *
                    </label>

                    <button
                      type="button"
                      aria-labelledby="subcounty-label"
                      aria-haspopup="listbox"
                      aria-expanded={subCountyDropdownOpen}
                      disabled={!county || availableSubCounties.length === 0}
                      onClick={() => {
                        setCountyDropdownOpen(false);
                        setSubCountyDropdownOpen((open) => !open);
                      }}
                      className="
      w-full flex items-center justify-between gap-2
      px-3.5 py-3 rounded-xl
      bg-[#F7F3EC] dark:bg-[#151515]
      text-[#242424] dark:text-[#F5F1E8]
      border border-[#E2D3C2] dark:border-[#40362E]
      shadow-[inset_2px_2px_5px_rgba(104,73,43,0.06)]
      dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35)]
      text-xs font-medium text-left
      focus:outline-none focus:ring-2 focus:ring-[#C49A6C]/30
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all cursor-pointer
    "
                    >
                      <span className="truncate">
                        {subCounty ||
                          (!county
                            ? 'Select County First'
                            : availableSubCounties.length === 0
                              ? 'No Sub-Counties'
                              : 'Select Sub-County')}
                      </span>

                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-[#946B46] dark:text-[#C49A6C] transition-transform duration-200 ${subCountyDropdownOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {subCountyDropdownOpen &&
                      county &&
                      availableSubCounties.length > 0 && (
                        <div
                          role="listbox"
                          aria-labelledby="subcounty-label"
                          className="
          absolute left-0 right-0 top-[calc(100%+6px)]
          z-50 max-h-56 overflow-y-auto
          rounded-xl
          bg-[#F7F3EC] dark:bg-[#181818]
          border border-[#E2D3C2] dark:border-[#40362E]
          shadow-[0_12px_30px_rgba(0,0,0,0.16)]
          dark:shadow-[0_14px_35px_rgba(0,0,0,0.55)]
        "
                        >
                          {availableSubCounties.map((s) => {
                            const isSelected = subCounty === s.name;

                            return (
                              <button
                                key={s.code || s.name}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  handleSubCountyChange(s.name);
                                  setSubCountyDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left text-xs transition-colors cursor-pointer ${isSelected
                                  ? 'bg-[#EAD7BF] dark:bg-[#493525] text-[#946B46] dark:text-[#E8BE92] font-bold'
                                  : 'text-[#242424] dark:text-[#F5F1E8] hover:bg-[#F0E5D8] dark:hover:bg-[#24201C]'
                                  }`}
                              >
                                <span>{s.name}</span>

                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C49A6C]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                  </div>

                  {/* Ward */}
                  <div className="relative">
                    <label
                      id="ward-label"
                      className="block text-xs font-bold text-[#66513F] dark:text-[#D4C2B0] mb-1.5"
                    >
                      Ward *
                    </label>

                    <button
                      type="button"
                      aria-labelledby="ward-label"
                      aria-haspopup="listbox"
                      aria-expanded={wardDropdownOpen}
                      disabled={!subCounty || availableWards.length === 0}
                      onClick={() => {
                        setCountyDropdownOpen(false);
                        setSubCountyDropdownOpen(false);
                        setWardDropdownOpen((open) => !open);
                      }}
                      className="
      w-full flex items-center justify-between gap-2
      px-3.5 py-3 rounded-xl
      bg-[#F7F3EC] dark:bg-[#151515]
      text-[#242424] dark:text-[#F5F1E8]
      border border-[#E2D3C2] dark:border-[#40362E]
      shadow-[inset_2px_2px_5px_rgba(104,73,43,0.06)]
      dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35)]
      text-xs font-medium text-left
      focus:outline-none focus:ring-2 focus:ring-[#C49A6C]/30
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all cursor-pointer
    "
                    >
                      <span className="truncate">
                        {ward ||
                          (!subCounty
                            ? 'Select Sub-County First'
                            : availableWards.length === 0
                              ? 'No Wards'
                              : 'Select Ward')}
                      </span>

                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-[#946B46] dark:text-[#C49A6C] transition-transform duration-200 ${wardDropdownOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {wardDropdownOpen &&
                      subCounty &&
                      availableWards.length > 0 && (
                        <div
                          role="listbox"
                          aria-labelledby="ward-label"
                          className="
          absolute left-0 right-0 top-[calc(100%+6px)]
          z-50 max-h-56 overflow-y-auto rounded-xl
          bg-[#F7F3EC] dark:bg-[#181818]
          border border-[#E2D3C2] dark:border-[#40362E]
          shadow-[0_12px_30px_rgba(0,0,0,0.16)]
          dark:shadow-[0_14px_35px_rgba(0,0,0,0.55)]
        "
                        >
                          {availableWards.map((w) => {
                            const isSelected = ward === w.name;

                            return (
                              <button
                                key={w.code || w.name}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  handleWardChange(w.name);
                                  setWardDropdownOpen(false);
                                }}
                                className={`
                w-full flex items-center justify-between gap-2
                px-3.5 py-3 text-left text-xs
                transition-colors cursor-pointer
                ${isSelected
                                    ? 'bg-[#EAD7BF] dark:bg-[#493525] text-[#946B46] dark:text-[#E8BE92] font-bold'
                                    : 'text-[#242424] dark:text-[#F5F1E8] hover:bg-[#F0E5D8] dark:hover:bg-[#24201C]'
                                  }
              `}
                              >
                                <span>{w.name}</span>

                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C49A6C]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                  </div>

                  {/* Estate */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3] mb-1">Estate / Area *</label>
                    <input
                      type="text"
                      value={estate}
                      onChange={(e) => setEstate(e.target.value)}
                      placeholder="e.g. Seasons / Mirema / Kilimani"
                      className="
    w-full px-3.5 py-3 rounded-xl
    bg-[#F7F3EC] dark:bg-[#151515]
    text-[#242424] dark:text-[#F5F1E8]
    placeholder:text-[#9A8B7A] dark:placeholder:text-[#85796E]
    border border-[#E2D3C2] dark:border-[#40362E]
    shadow-[inset_2px_2px_5px_rgba(104,73,43,0.06)]
    dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35)]
    text-xs font-medium
    focus:outline-none focus:ring-2 focus:ring-[#C49A6C]/30
    transition-all
  "
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
                    className="
    w-full px-3.5 py-3 rounded-xl
    bg-[#F7F3EC] dark:bg-[#151515]
    text-[#242424] dark:text-[#F5F1E8]
    placeholder:text-[#9A8B7A] dark:placeholder:text-[#85796E]
    border border-[#E2D3C2] dark:border-[#40362E]
    shadow-[inset_2px_2px_5px_rgba(104,73,43,0.06)]
    dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35)]
    text-xs font-medium
    focus:outline-none focus:ring-2 focus:ring-[#C49A6C]/30
    transition-all
  "
                  />
                </div>

                {/* Pin-Drop Location Map */}
                <div id="property-location-map">

                  <div className="rounded-2xl border border-neutral-200 dark:border-[#292929] overflow-hidden">
                    <PropertyLocationPickerMap
                      unitTypeLabel={
                        selectedUnitTypes.length > 1
                          ? 'Mixed Units'
                          : selectedUnitTypes[0] || type
                      }
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
            </div> {/* End of Property Location wrapper */}

            {/* Property Contact Phone Number */}
            <div className="space-y-3">
              <label
                htmlFor="property-contact-phone"
                className="block text-lg font-bold text-[#242424] dark:text-[#F5F1E8]"
              >
                Contact Phone Number
                <span className="ml-1 text-[#B4534C]">*</span>
              </label>

              <input
                id="property-contact-phone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. 0712345678 or +254712345678"
                pattern="0[17][0-9]{8}|\+254[17][0-9]{8}"
                title="Enter a valid Kenyan number, such as 0712345678 or +254712345678"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#F7F3EC] dark:bg-[#151515] text-[#242424] dark:text-[#F5F1E8] border border-[#E2D3C2] dark:border-[#40362E] focus:outline-none focus:ring-2 focus:ring-[#C49A6C]/30"
              />

              <p className="text-xs text-[#77716C] dark:text-[#A3A3A3]">
                Seekers will use this number to contact you directly about this property.

              </p>
            </div>


            {/* Section 5: Monthly Rent & Move-In Costs (KSh) */}

            <h2 className="text-lg font-bold text-[#242424] dark:text-[#F5F1E8] mb-4">
              5. Monthly Rent & Move-In Costs (KSh)
              <span className="text-[#B4534C]"> *</span>
            </h2>

            <div className="rounded-2xl border border-[#E2D3C2] bg-[#F8F5EF] p-6 sm:p-8 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.04)] dark:bg-[#151515] dark:border-neutral-800">


              {isEditMode ? (
                <>

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

                  {/* Row 2: Water Deposit, Electricity Deposit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2gap-4 pt-2 border-t border-neutral-100 dark:border-[#262626]">
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
                </>
              ) : (

                <div className="space-y-5">
                  {/* Horizontally scrollable unit-type tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedUnitTypes.map((unitType) => {
                      const isActive =
                        (activeUnitType || selectedUnitTypes[0]) === unitType;

                      return (
                        <button
                          key={unitType}
                          type="button"
                          onClick={() => setActiveUnitType(unitType)}
                          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${isActive
                            ? 'bg-[#C49A6C] text-white'
                            : 'bg-[#F7F3EC] text-[#8B6B43] border border-[#E2D3C2]'
                            }`}
                        >
                          {unitType}
                        </button>
                      );
                    })}
                  </div>

                  {/* Pricing fields for the selected unit type */}
                  {selectedUnitTypes
                    .filter(
                      (unitType) =>
                        unitType === (activeUnitType || selectedUnitTypes[0])
                    )
                    .map((unitType) => {
                      const details =
                        mixedUnitDetails[unitType] ?? createEmptyUnitDetails();

                      const fields: {
                        key: keyof UnitDetails;
                        label: string;
                        required?: boolean;
                      }[] = [
                          { key: 'monthlyRent', label: 'Monthly Rent (KSh)', required: true },
                          { key: 'deposit', label: 'Security Deposit (KSh)' },
                          { key: 'serviceCharge', label: 'Service Charge (KSh/mo)' },
                          { key: 'waterDeposit', label: 'Water Deposit (KSh)' },
                          { key: 'electricityDeposit', label: 'Electricity Deposit (KSh)' },
                          { key: 'agentFee', label: 'Agent Fee (KSh)' },
                          { key: 'viewingFee', label: 'Viewing Fee (KSh)' }
                        ];

                      return (


                        <div
                          key={unitType}
                          id="mixed-unit-pricing"
                          className="w-full scroll-mt-24"
                        >



                          <h3 className="mb-5 text-base font-semibold text-[#242424] dark:text-white">
                            {unitType} Pricing
                          </h3>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {fields.map((field) => (
                              <div key={field.key}>
                                <label className="mb-1 block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3]">
                                  {field.label}
                                  {field.required && <span className="text-red-500"> *</span>}
                                </label>

                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={details[field.key]}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                      updateMixedUnitDetail(unitType, field.key, value);
                                    }
                                  }}
                                  placeholder="e.g. 14000"
                                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-all focus:border-[#C49A6C] dark:border-[#393939] dark:bg-[#242424] dark:text-white"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>

              )}
            </div>




            {/* Section 6: Availability & Units Breakdown */}

            <h2 className="text-lg font-bold text-[#242424] dark:text-[#F5F1E8] mb-4">
              6. Availability & Units Breakdown
              <span className="text-[#B4534C]"> *</span>
            </h2>

            <div className="rounded-2xl border border-[#E2D3C2] bg-[#F8F5EF] p-6 sm:p-8 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.04)] dark:bg-[#151515] dark:border-neutral-800">


              {isEditMode ? (
                <>


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

                </>
              ) : (
                <div className="space-y-5">
                  {/* Unit-type tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedUnitTypes.map((unitType) => {
                      const isActive =
                        (activeUnitType || selectedUnitTypes[0]) === unitType;

                      return (
                        <button
                          key={unitType}
                          type="button"
                          onClick={() => setActiveUnitType(unitType)}
                          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${isActive
                            ? 'bg-[#C49A6C] text-white'
                            : 'border border-[#E2D3C2] bg-[#F7F3EC] text-[#8B6B43]'
                            }`}
                        >
                          {unitType}
                        </button>
                      );
                    })}
                  </div>

                  {/* Availability for active unit type */}
                  {selectedUnitTypes
                    .filter(
                      (unitType) =>
                        unitType === (activeUnitType || selectedUnitTypes[0])
                    )
                    .map((unitType) => {
                      const details =
                        mixedUnitDetails[unitType] ?? createEmptyUnitDetails();

                      const fields: {
                        key: 'vacancies' | 'occupied' | 'underRepair';
                        label: string;
                      }[] = [
                          { key: 'vacancies', label: 'Vacant Units (Available)' },
                          { key: 'occupied', label: 'Occupied Units (Tenanted)' },
                          { key: 'underRepair', label: 'Under Repair / Renovation' }
                        ];

                      return (
                        <div key={unitType} className="w-full">
                          <h3 className="mb-5 text-base font-semibold text-[#242424] dark:text-white">
                            {unitType} Availability
                          </h3>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {fields.map((field) => (
                              <div key={field.key}>
                                <label className="mb-1 block text-xs font-bold text-neutral-700 dark:text-[#A3A3A3]">
                                  {field.label}
                                  {field.key === 'vacancies' && (
                                    <span className="text-red-500"> *</span>
                                  )}
                                </label>

                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={details[field.key]}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                      updateMixedUnitDetail(
                                        unitType,
                                        field.key,
                                        value
                                      );
                                    }
                                  }}
                                  placeholder="0"
                                  className="w-full rounded-xl border border-[#E2D3C2] bg-[#F8F5EF] px-3.5 py-2.5 text-sm text-[#242424] outline-none transition-all focus:border-[#C49A6C] dark:border-[#393939] dark:bg-[#242424] dark:text-white"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>



            {/* Section 7: Amenities & Facilities */}

            <h2 className="text-lg font-bold text-[#242424] dark:text-[#F5F1E8] mb-4">
              7. Amenities & Facilities
              <span className="text-[#B4534C]"> *</span>
            </h2>

            <div className="rounded-2xl border border-[#E2D3C2] bg-[#F8F5EF] p-6 sm:p-8 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.04)] dark:bg-[#151515] dark:border-neutral-800">


              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AMENITY_OPTIONS.map((item) => {
                  const isChecked = amenities.includes(item);
                  return (

                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 ${isChecked
                        ? 'bg-[#F0E8DC] border-[#C49A6C] text-[#8B6B43] shadow-[inset_2px_2px_4px_rgba(139,107,67,0.12),inset_-2px_-2px_4px_rgba(255,255,255,0.65)] dark:bg-[#302820] dark:border-[#C49A6C] dark:text-[#D8B38A]'
                        : 'bg-[#F8F5EF] border-[#E2D3C2] text-[#242424] hover:border-[#C49A6C] shadow-[2px_2px_5px_rgba(139,107,67,0.05),-2px_-2px_5px_rgba(255,255,255,0.6)] dark:bg-[#242424] dark:border-[#393939] dark:text-[#F5F1E8]'
                        }`}
                    >
                      <div
                        className={`w-4 h-4 shrink-0 rounded flex items-center justify-center text-[10px] ${isChecked
                          ? 'bg-[#C49A6C] text-white'
                          : 'border border-[#C49A6C] bg-[#F8F5EF] dark:bg-[#181818]'
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
              className="rounded-2xl border border-[#E2D3C2] bg-[#F8F5EF] p-6 sm:p-8 shadow-[inset_2px_2px_5px_rgba(139,107,67,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] dark:border-[#393939] dark:bg-[#181818] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.25)]"
            >

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-neutral-100 dark:border-[#262626] gap-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-black dark:text-white" />
                  <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">
                    8. Cover Photo <span className="text-red-500">*</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${images.length > 0
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-[#181818] text-neutral-600 dark:text-[#A3A3A3]'
                      }`}
                  >
                    {!isEditMode ? 'Cover Photo' : 'Property Photos'} ({images.length}/{!isEditMode ? 1 : 10})
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                {!isEditMode
                  ? 'Upload one cover photo of the building. JPG, JPEG, PNG or WebP.'
                  : 'Upload up to 10 property photos. JPG, JPEG, PNG or WebP. The first photo will be used as the cover.'}
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
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${isDragging
                    ? 'border-[#C49A6C] dark:border-[#C49A6C] bg-[#F8F5EF] dark:bg-[#242424] scale-[0.99]'
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
                        JPG, JPEG, PNG or WebP (max {selectedUnitTypes.length > 1 ? '1 photo' : '10 photos'})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-5 py-2.5 bg-[#C49A6C] dark:bg-[#C49A6C] text-white dark:text-white hover:bg-[#AD8255] dark:hover:bg-neutral-200 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{selectedUnitTypes.length > 1 ? 'Add Cover Photo' : 'Add Property Photos'}</span>
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
                          className={`relative aspect-4/3 rounded-2xl overflow-hidden border group bg-neutral-100 dark:bg-[#181818] shadow-xs transition-all ${isCover
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
                    {images.length < (selectedUnitTypes.length > 1 ? 1 : 10) && (
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


              {!isEditMode && selectedUnitTypes.length >= 1 && (
                <div className="mt-6 border-t border-[#E2D3C2] pt-6">
                  <h3 className="mb-2 text-base font-semibold text-[#242424] dark:text-white">
                    Unit Photos
                  </h3>

                  <p className="mb-4 text-xs text-[#8B6B43] dark:text-[#D8B38A]">
                    Upload up to 10 photos for each selected unit type.
                  </p>

                  <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
                    {selectedUnitTypes.map((unitType) => {
                      const isActive =
                        (activeUnitType || selectedUnitTypes[0]) === unitType;

                      return (
                        <button
                          key={unitType}
                          type="button"
                          onClick={() => setActiveUnitType(unitType)}
                          className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${isActive
                            ? 'border-[#C49A6C] bg-[#C49A6C] text-white'
                            : 'border-[#E2D3C2] bg-[#F8F5EF] text-[#8B6B43] dark:border-[#393939] dark:bg-[#242424] dark:text-[#D8B38A]'
                            }`}
                        >
                          {unitType}
                        </button>
                      );
                    })}
                  </div>

                  {selectedUnitTypes
                    .filter(
                      (unitType) =>
                        unitType === (activeUnitType || selectedUnitTypes[0])
                    )
                    .map((unitType) => {
                      const media =
                        mixedUnitMedia[unitType] ?? createEmptyUnitMedia();

                      return (
                        <div key={unitType} className="space-y-4">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-[#242424] dark:text-white">
                              {unitType} Photos
                            </h4>
                            <span className="text-xs text-[#8B6B43]">
                              {media.images.length}/10
                            </span>
                          </div>

                          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E2D3C2] bg-[#F8F5EF] px-4 py-8 text-center hover:border-[#C49A6C] dark:border-[#393939] dark:bg-[#242424]">
                            <ImagePlus className="h-6 w-6 text-[#C49A6C]" />
                            <span className="text-sm font-semibold text-[#242424] dark:text-white">
                              Add {unitType} Photos
                            </span>
                            <span className="text-xs text-[#8B6B43]">
                              JPG, PNG or WebP · Maximum 10 photos
                            </span>

                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              multiple
                              className="hidden"
                              disabled={media.images.length >= 10}
                              onChange={(e) => {
                                handleMixedUnitPhotosSelected(unitType, e.target.files);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          {media.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {media.images.map((image, index) => (
                                <div
                                  key={`${unitType}-${index}`}
                                  className="relative overflow-hidden rounded-xl border border-[#E2D3C2]"
                                >
                                  <img
                                    src={image}
                                    alt={`${unitType} photo ${index + 1}`}
                                    className="aspect-square w-full object-cover"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveMixedUnitPhoto(unitType, index)
                                    }
                                    className="absolute right-2 top-2 rounded-lg bg-white/95 p-2 text-red-600 shadow-sm"
                                    title="Remove photo"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-5 border-t border-[#E2D3C2] pt-5">
                            <h4 className="mb-3 text-sm font-semibold text-[#242424] dark:text-white">
                              House Tour
                              <span className="ml-2 text-xs font-normal text-[#8B6B43]">
                                Optional
                              </span>
                            </h4>

                            {media.videoUrl ? (
                              <div className="space-y-3">
                                <video
                                  src={media.videoUrl}
                                  controls
                                  playsInline
                                  className="w-full rounded-xl"
                                />

                                <button
                                  type="button"
                                  onClick={() => {
                                    const oldUrl = media.videoUrl;

                                    if (oldUrl?.startsWith('blob:')) {
                                      URL.revokeObjectURL(oldUrl);
                                      createdObjectUrlsRef.current.delete(oldUrl);
                                    }

                                    setMixedUnitMedia((previous) => ({
                                      ...previous,
                                      [unitType]: {
                                        ...(previous[unitType] ?? createEmptyUnitMedia()),
                                        videoUrl: null,
                                        videoFile: null
                                      }
                                    }));
                                  }}
                                  className="rounded-xl border border-[#E2D3C2] px-4 py-2 text-xs font-medium text-red-600"
                                >
                                  Remove Video
                                </button>
                              </div>
                            ) : (
                              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E2D3C2] p-6 text-center hover:border-[#C49A6C]">
                                <Video className="h-6 w-6 text-[#C49A6C]" />

                                <span className="text-sm font-medium text-[#242424] dark:text-white">
                                  Add {unitType} House Tour
                                </span>

                                <span className="text-xs text-[#8B6B43]">
                                  MP4 or WebM · Max 100 MB
                                </span>

                                <input
                                  type="file"
                                  accept="video/mp4,video/webm"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleMixedUnitVideoSelected(unitType, e.target.files);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            )}
                          </div>

                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Existing unit photographs — Edit Listing only */}
            {isEditMode &&
              editingProperty?.type !== 'Mixed Units' &&
              editUnitStatus !== 'none' && (
                <section
                  id="edit-unit-photos-section"
                  className="rounded-2xl border border-[#E2D3C2] bg-[#F8F5EF] p-5 sm:p-7 dark:border-[#393939] dark:bg-[#181818]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[#242424] dark:text-[#F5F5F5]">
                      Unit Photographs
                    </h2>

                    {editUnitStatus === 'ready' && (
                      <span className="text-xs font-medium text-[#946B46] dark:text-[#C49A6C]">
                        {editUnitPhotos.length}/10
                      </span>
                    )}
                  </div>

                  <p className="mb-4 text-xs text-neutral-500 dark:text-[#A3A3A3]">
                    These are the photographs displayed in the property gallery.
                    The first photograph is the unit cover.
                  </p>

                  {editUnitStatus === 'loading' && (
                    <p className="text-sm text-[#946B46]">
                      Loading existing photographs...
                    </p>
                  )}

                  {editUnitPhotoError && (
                    <p
                      role="alert"
                      className="mb-4 rounded-xl border border-red-300 p-3 text-xs text-red-600 dark:text-red-400"
                    >
                      {editUnitPhotoError}
                    </p>
                  )}

                  {editUnitStatus === 'ready' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {editUnitPhotos.map((photo, index) => (
                          <div
                            key={photo.storageId ?? photo.url}
                            className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#D8C7B1] dark:border-[#44403B]"
                          >
                            <img
                              src={photo.url}
                              alt={`Unit photo ${index + 1}`}
                              className="h-full w-full object-cover"
                            />

                            {index === 0 ? (
                              <span className="absolute bottom-2 left-2 rounded-lg bg-black/85 px-2 py-1 text-[10px] font-semibold text-white">
                                Unit Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetEditUnitCover(index)}
                                className="absolute bottom-2 left-2 rounded-lg bg-black/85 px-2 py-1 text-[10px] font-semibold text-white"
                              >
                                Set as Cover
                              </button>
                            )}

                            <button
                              type="button"
                              aria-label={`Remove unit photo ${index + 1}`}
                              onClick={() => handleRemoveEditUnitPhoto(index)}
                              className="absolute right-2 top-2 rounded-lg bg-black/85 p-1.5 text-white hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {editUnitPhotos.length < 10 && (
                        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#C49A6C] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#AD8255]">
                          <ImagePlus className="h-4 w-4" />
                          Add Unit Photos

                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) => {
                              handleEditUnitPhotosSelected(event.target.files);
                              event.target.value = '';
                            }}
                          />
                        </label>
                      )}

                      {editUnitDirty && (
                        <p className="mt-3 text-xs text-[#946B46] dark:text-[#D8B38A]">
                          Unit photo changes have not been saved yet.
                        </p>
                      )}
                    </>
                  )}
                </section>
              )}

            {/* Section 7: Property Video (Optional) */}
            {selectedUnitTypes.length <= 1 && (
              <div
                id="property-video-section"
                className="rounded-2xl border border-[#E2D3C2] bg-[#F8F5EF] p-6 sm:p-8 shadow-[inset_2px_2px_5px_rgba(139,107,67,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] dark:border-[#393939] dark:bg-[#181818] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.25)]"
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
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${isVideoDragging
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
                        className="px-5 py-2.5 bg-[#C49A6C] dark:bg-[#C49A6C] text-white dark:text-white hover:bg-[#AD8255] dark:hover:bg-neutral-200 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
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
            )}
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
                className={`px-8 py-3.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-bold rounded-2xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer ${isSubmitting ? 'opacity-80 cursor-wait' : ''
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
    </div >
  );
};
