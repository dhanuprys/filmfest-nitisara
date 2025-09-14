import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { registrationSchema, type RegistrationFormData } from '@/lib/schemas/registration';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Building,
    Camera,
    CheckCircle,
    Clock,
    CreditCard,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Trophy,
    Upload,
    User,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import SafeWidth from '../safe-width';

interface JoinFormProps {
    eventYears: Array<{
        id: number;
        year: number;
        registration_start: string;
        registration_end: string;
    }>;
    categories: Array<{
        id: number;
        name: string;
    }>;
}

const STORAGE_KEY = 'nitisara_registration_form';

// Debounce function to limit localStorage writes
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export default function JoinForm({ eventYears, categories }: JoinFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentCardFile, setStudentCardFile] = useState<File | null>(null);
    const [paymentEvidenceFile, setPaymentEvidenceFile] = useState<File | null>(null);
    const [activeStep, setActiveStep] = useState(1);
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [showResetTooltip, setShowResetTooltip] = useState(false);
    // 1. Add state for the confirmation checkbox
    const [isReadyChecked, setIsReadyChecked] = useState(false);
    const [teamNameUnique, setTeamNameUnique] = useState(true);
    const [checkingTeamName, setCheckingTeamName] = useState(false);

    // Load cached form data from localStorage - memoized to prevent unnecessary calls
    const loadCachedFormData = useCallback((): Partial<RegistrationFormData> => {
        if (typeof window === 'undefined') return {};

        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? JSON.parse(cached) : {};
        } catch (error) {
            console.warn('Failed to load cached form data:', error);
            return {};
        }
    }, []);

    // Save form data to localStorage - debounced to prevent excessive writes
    const saveFormData = useMemo(
        () =>
            debounce((data: Partial<RegistrationFormData>) => {
                if (typeof window === 'undefined') return;

                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                } catch (error) {
                    console.warn('Failed to save form data:', error);
                }
            }, 300),
        [],
    );

    // Clear cached form data
    const clearCachedFormData = useCallback(() => {
        if (typeof window === 'undefined') return;

        setTimeout(() => {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                console.warn('Failed to clear cached form data:', error);
            }
        }, 200);
    }, []);

    const form = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            team_name: '',
            city: '',
            company: '',
            category_id: '',
            leader_name: '',
            leader_email: '',
            leader_whatsapp: '',
            ...loadCachedFormData(),
        },
    });

    // Memoize watched values to prevent unnecessary re-renders
    const watchedValues = form.watch();
    const formDataToSave = useMemo(
        () => ({
            team_name: watchedValues.team_name,
            city: watchedValues.city,
            company: watchedValues.company,
            category_id: watchedValues.category_id,
            leader_name: watchedValues.leader_name,
            leader_email: watchedValues.leader_email,
            leader_whatsapp: watchedValues.leader_whatsapp,
        }),
        [watchedValues],
    );

    // Save form data to localStorage with debouncing
    useEffect(() => {
        saveFormData(formDataToSave);
    }, [formDataToSave, saveFormData]);

    // Handle keyboard shortcuts - memoized event handler
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Ctrl/Cmd + R to reset form
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            handleResetForm();
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Memoize reset form function
    const handleResetForm = useCallback(() => {
        form.reset({
            team_name: '',
            city: '',
            company: '',
            category_id: '',
            leader_name: '',
            leader_email: '',
            leader_whatsapp: '',
        });
        setStudentCardFile(null);
        setPaymentEvidenceFile(null);
        setActiveStep(1);
        clearCachedFormData();

        // Show tooltip feedback
        setShowResetTooltip(true);
        setTimeout(() => setShowResetTooltip(false), 2000);
    }, [form, clearCachedFormData]);

    // Memoize submit handler
    const onSubmit = useCallback(
        async (data: RegistrationFormData) => {
            if (!studentCardFile || !paymentEvidenceFile) {
                return;
            }

            // Validate all form fields before submission
            const isValid = await form.trigger();

            // Also check if files are uploaded
            if (!studentCardFile || !paymentEvidenceFile) {
                return;
            }

            if (!isValid) {
                // If validation fails, scroll to the error summary
                const errorElement = document.querySelector('[data-error-summary]');
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('team_name', data.team_name);
            formData.append('city', data.city);
            formData.append('company', data.company);
            formData.append('category_id', data.category_id);
            formData.append('leader_name', data.leader_name);
            formData.append('leader_email', data.leader_email);
            formData.append('leader_whatsapp', data.leader_whatsapp);
            formData.append('student_card_file', studentCardFile);
            formData.append('payment_evidence_file', paymentEvidenceFile);

            router.post('/registration', formData, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    // Clear cached data on successful submission
                    clearCachedFormData();
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            });
        },
        [studentCardFile, paymentEvidenceFile, clearCachedFormData, form],
    );

    // Memoize file change handlers
    const handleFileChange = useCallback((field: 'student_card_file' | 'payment_evidence_file', file: File | null) => {
        if (field === 'student_card_file') {
            setStudentCardFile(file);
        } else {
            setPaymentEvidenceFile(file);
        }
    }, []);

    // Memoize drag handlers
    const handleDragOver = useCallback((e: React.DragEvent, field: string) => {
        e.preventDefault();
        setDragOver(field);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, field: 'student_card_file' | 'payment_evidence_file') => {
            e.preventDefault();
            setDragOver(null);
            const file = e.dataTransfer.files[0];
            if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
                handleFileChange(field, file);
            }
        },
        [handleFileChange],
    );

    const removeFile = useCallback(
        (field: 'student_card_file' | 'payment_evidence_file') => {
            handleFileChange(field, null);
        },
        [handleFileChange],
    );

    // Memoize utility functions
    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    // Memoize steps array
    const steps = useMemo(
        () => [
            { id: 1, title: 'Tim', icon: Users },
            { id: 2, title: 'Ketua Tim', icon: User },
            { id: 3, title: 'Dokumen', icon: Upload },
            { id: 4, title: 'Konfirmasi', icon: CheckCircle },
        ],
        [],
    );

    // Helper: get fields for each step
    const stepFields: Record<number, (keyof RegistrationFormData)[]> = {
        1: ['team_name', 'city', 'company', 'category_id'],
        2: ['leader_name', 'leader_email', 'leader_whatsapp'],
        3: [], // files handled separately
        4: [], // confirmation handled separately
    };

    // Refactor isStepComplete to only check relevant fields for each step
    const isStepComplete = useCallback(
        (step: number) => {
            const values = form.getValues();
            switch (step) {
                case 1:
                    return stepFields[1].every((field) => values[field]);
                case 2:
                    return stepFields[2].every((field) => values[field]);
                case 3:
                    return studentCardFile && paymentEvidenceFile;
                case 4:
                    return isReadyChecked;
                default:
                    return false;
            }
        },
        [form, studentCardFile, paymentEvidenceFile, isReadyChecked],
    );

    // Helper: get errors for a step
    const getStepErrors = (step: number) => {
        const errors = form.formState.errors;
        if (step === 1) return stepFields[1].filter((field) => errors[field]);
        if (step === 2) return stepFields[2].filter((field) => errors[field]);
        if (step === 3) return []; // files handled separately
        if (step === 4) return [];
        return [];
    };

    // Refactor canProceedToStep to only check errors for the previous step
    const canProceedToStep = useCallback(
        (step: number) => {
            if (step === 1) return true;
            const previousStep = step - 1;
            const isPreviousStepComplete = isStepComplete(previousStep);
            const hasStepErrors = getStepErrors(previousStep).length > 0;
            return isPreviousStepComplete && !hasStepErrors;
        },
        [isStepComplete, form.formState.errors],
    );

    // Memoize progress calculation
    const stepProgress = useMemo(() => {
        const completedSteps = steps.filter((step) => isStepComplete(step.id)).length;
        return (completedSteps / steps.length) * 100;
    }, [steps, isStepComplete]);

    // Memoize step navigation
    const handleStepChange = useCallback(
        (step: number) => {
            if (canProceedToStep(step)) {
                setActiveStep(step);
            }
        },
        [canProceedToStep],
    );

    // Memoize step navigation buttons
    const handlePreviousStep = useCallback(() => {
        setActiveStep(Math.max(1, activeStep - 1));
    }, [activeStep]);

    // Update handleNextStep to only validate current step fields
    const handleNextStep = useCallback(() => {
        const currentStep = activeStep;
        const fieldsToValidate = stepFields[currentStep] || [];
        if (fieldsToValidate.length > 0) {
            form.trigger(fieldsToValidate as any);
        }
        if (getStepErrors(currentStep).length > 0 || !isStepComplete(currentStep)) {
            return;
        }
        setActiveStep(activeStep + 1);
    }, [activeStep, form, isStepComplete]);

    // Check team name uniqueness
    useEffect(() => {
        const teamName = form.getValues('team_name');
        const eventYearId = eventYears[0]?.id;
        if (!teamName || !eventYearId) {
            setTeamNameUnique(true);
            return;
        }
        setCheckingTeamName(true);
        const controller = new AbortController();
        fetch(`/registration/check-team-name?team_name=${encodeURIComponent(teamName)}&event_year_id=${eventYearId}`, {
            signal: controller.signal,
        })
            .then((res) => res.json())
            .then((data) => {
                setTeamNameUnique(data.unique);
            })
            .catch(() => {
                setTeamNameUnique(true); // fallback to allow
            })
            .finally(() => setCheckingTeamName(false));
        return () => controller.abort();
    }, [form.watch('team_name'), eventYears]);

    return (
        <SafeWidth className="py-16">
            <div className="mx-auto max-w-4xl">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <div className="mb-4 flex items-center justify-center gap-2">
                        <div className="relative">
                            <Trophy className="text-primary h-8 w-8 animate-pulse" />
                            <div className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-green-500" />
                        </div>
                        <h1 className="font-luckiest from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-3xl text-transparent">
                            Pendaftaran
                        </h1>
                    </div>
                    <p className="text-muted-foreground mx-auto max-w-2xl">
                        Bergabunglah dengan festival film terbesar! Daftarkan tim Anda sekarang dan tunjukkan
                        kreativitas film Anda.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = activeStep === step.id;
                            const isComplete = isStepComplete(step.id);
                            const hasErrors = getStepErrors(step.id).length > 0;
                            const canAccess = step.id <= activeStep || isComplete;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleStepChange(step.id)}
                                                    disabled={!canAccess}
                                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 hover:scale-105 sm:px-4 ${isActive
                                                            ? 'bg-primary text-primary-foreground shadow-lg'
                                                            : isComplete
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                : canAccess
                                                                    ? 'bg-muted hover:bg-muted/80'
                                                                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                                                        } ${hasErrors && !isActive ? 'ring-2 ring-red-500' : ''}`}
                                                >
                                                    {isComplete ? (
                                                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                                    ) : (
                                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                                    )}
                                                    <span className="hidden whitespace-nowrap sm:inline">
                                                        {step.title}
                                                    </span>
                                                    {hasErrors && !isActive && (
                                                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                                                    )}
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{step.title}</p>
                                                {hasErrors && !isActive && (
                                                    <p className="text-xs text-red-500">
                                                        Ada kesalahan yang perlu diperbaiki
                                                    </p>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`mx-1 h-0.5 w-4 transition-all duration-300 sm:mx-2 sm:w-8 ${isStepComplete(step.id) ? 'bg-green-300' : 'bg-muted'
                                                }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-xl dark:from-gray-900 dark:to-gray-800/50">
                    <CardHeader className="from-primary/5 to-secondary/5 border-b bg-gradient-to-r px-4 py-6 text-center sm:px-8 sm:py-8">
                        <div className="grid grid-cols-1 items-center justify-between gap-4 sm:grid-cols-5">
                            <div className="order-2 sm:order-1 sm:col-span-1" />
                            <div className="order-1 sm:order-2 sm:col-span-3">
                                <CardTitle className="mb-2 shrink-0 text-lg sm:text-xl">
                                    {activeStep === 1 && 'Informasi Tim'}
                                    {activeStep === 2 && 'Informasi Ketua Tim'}
                                    {activeStep === 3 && 'Upload Dokumen'}
                                    {activeStep === 4 && 'Konfirmasi'}
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    {activeStep === 1 && 'Isi informasi tim Anda'}
                                    {activeStep === 2 && 'Isi data ketua tim untuk komunikasi'}
                                    {activeStep === 3 && 'Upload dokumen yang diperlukan'}
                                    {activeStep === 4 && 'Konfirmasi pendaftaran'}
                                </CardDescription>
                            </div>
                            <div className="order-3 flex justify-center sm:col-span-1 sm:justify-end">
                                <TooltipProvider>
                                    <Tooltip open={showResetTooltip}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleResetForm}
                                                className="h-8 w-8"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Reset form (Ctrl+R)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Error Summary */}
                                {Object.keys(form.formState.errors).length > 0 && (
                                    <Alert variant="destructive" data-error-summary>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="space-y-1">
                                                <p className="font-semibold">Mohon perbaiki kesalahan berikut:</p>
                                                <ul className="list-disc space-y-1 pl-4">
                                                    {Object.entries(form.formState.errors).map(([field, error]) => (
                                                        <li key={field} className="text-sm">
                                                            {error?.message as string}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {/* Step 1: Event & Team Information */}
                                {activeStep === 1 && (
                                    <div className="animate-in slide-in-from-left-2 space-y-6 duration-300">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="category_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2 text-base font-semibold">
                                                            <Camera className="text-primary h-5 w-5" />
                                                            Kategori Film
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="h-12">
                                                                    <SelectValue placeholder="Pilih kategori film" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {categories.map((category) => (
                                                                    <SelectItem
                                                                        key={category.id}
                                                                        value={category.id.toString()}
                                                                    >
                                                                        {category.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="text-primary h-5 w-5" />
                                                <h3 className="text-lg font-semibold">Informasi Tim</h3>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="team_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base">Nama Tim</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Masukkan nama tim yang kreatif"
                                                                className="h-12 text-base"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        {!teamNameUnique && !checkingTeamName && (
                                                            <p className="mt-1 text-xs text-red-500">
                                                                Nama tim sudah terdaftar untuk event tahun ini.
                                                            </p>
                                                        )}

                                                        <p
                                                            className={cn(
                                                                'mt-1 text-xs text-gray-500 opacity-0',
                                                                checkingTeamName && 'opacity-100',
                                                            )}
                                                        >
                                                            Memeriksa ketersediaan nama tim...
                                                        </p>

                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="city"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                                                Kota
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Kota asal tim"
                                                                    className="h-12"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="company"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Building className="h-4 w-4 flex-shrink-0" />
                                                                Perusahaan/Institusi
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Nama perusahaan/institusi"
                                                                    className="h-12"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Team Leader Information */}
                                {activeStep === 2 && (
                                    <div className="animate-in slide-in-from-left-2 space-y-6 duration-300">
                                        <div className="mb-4 flex items-center gap-2">
                                            <User className="text-primary h-5 w-5" />
                                            <h3 className="text-lg font-semibold">Informasi Ketua Tim</h3>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="leader_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base">Nama Ketua Tim</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nama lengkap ketua tim"
                                                            className="h-12 text-base"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="leader_email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 flex-shrink-0" />
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                placeholder="email@example.com"
                                                                className="h-12"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="leader_whatsapp"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 flex-shrink-0" />
                                                            WhatsApp
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="08123456789"
                                                                className="h-12"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Informasi ini akan digunakan untuk komunikasi resmi terkait festival
                                                film.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}

                                {/* Step 3: File Uploads */}
                                {activeStep === 3 && (
                                    <div className="animate-in slide-in-from-left-2 space-y-6 duration-300">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Upload className="text-primary h-5 w-5" />
                                            <h3 className="text-lg font-semibold">Upload Dokumen</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-4">
                                                <div
                                                    className={`rounded-lg border-2 border-dashed p-4 transition-all duration-200 sm:p-6 ${dragOver === 'student_card_file'
                                                            ? 'border-primary bg-primary/5 scale-105'
                                                            : studentCardFile
                                                                ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                                                                : 'border-primary/30 hover:border-primary/50'
                                                        }`}
                                                    onDragOver={(e) => handleDragOver(e, 'student_card_file')}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, 'student_card_file')}
                                                >
                                                    <div className="text-center">
                                                        <GraduationCap className="text-primary mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12" />
                                                        <h4 className="mb-2 text-sm font-semibold sm:text-base">
                                                            Kartu Mahasiswa
                                                        </h4>
                                                        <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                                                            Upload kartu mahasiswa ketua tim
                                                        </p>
                                                        {studentCardFile ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between rounded-lg bg-white p-2 sm:p-3 dark:bg-gray-800">
                                                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                                                        <FileText className="text-primary h-4 w-4 flex-shrink-0" />
                                                                        <div className="min-w-0 text-left">
                                                                            <p className="truncate text-xs font-medium sm:text-sm">
                                                                                {studentCardFile.name}
                                                                            </p>
                                                                            <p className="text-muted-foreground text-xs">
                                                                                {formatFileSize(studentCardFile.size)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeFile('student_card_file')}
                                                                        className="h-6 w-6 flex-shrink-0"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="flex items-center justify-center gap-2 text-xs text-green-600 sm:text-sm">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    File terupload
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Input
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) =>
                                                                    handleFileChange(
                                                                        'student_card_file',
                                                                        e.target.files?.[0] || null,
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div
                                                    className={`rounded-lg border-2 border-dashed p-4 transition-all duration-200 sm:p-6 ${dragOver === 'payment_evidence_file'
                                                            ? 'border-primary bg-primary/5 scale-105'
                                                            : paymentEvidenceFile
                                                                ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                                                                : 'border-primary/30 hover:border-primary/50'
                                                        }`}
                                                    onDragOver={(e) => handleDragOver(e, 'payment_evidence_file')}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, 'payment_evidence_file')}
                                                >
                                                    <div className="text-center">
                                                        <CreditCard className="text-primary mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12" />
                                                        <h4 className="mb-2 text-sm font-semibold sm:text-base">
                                                            Bukti Pembayaran
                                                        </h4>
                                                        <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                                                            Upload bukti pembayaran biaya pendaftaran
                                                        </p>
                                                        {paymentEvidenceFile ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between rounded-lg bg-white p-2 sm:p-3 dark:bg-gray-800">
                                                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                                                        <FileText className="text-primary h-4 w-4 flex-shrink-0" />
                                                                        <div className="min-w-0 text-left">
                                                                            <p className="truncate text-xs font-medium sm:text-sm">
                                                                                {paymentEvidenceFile.name}
                                                                            </p>
                                                                            <p className="text-muted-foreground text-xs">
                                                                                {formatFileSize(
                                                                                    paymentEvidenceFile.size,
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() =>
                                                                            removeFile('payment_evidence_file')
                                                                        }
                                                                        className="h-6 w-6 flex-shrink-0"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="flex items-center justify-center gap-2 text-xs text-green-600 sm:text-sm">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    File terupload
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Input
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) =>
                                                                    handleFileChange(
                                                                        'payment_evidence_file',
                                                                        e.target.files?.[0] || null,
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Alert>
                                            <FileText className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>Format yang diterima:</strong> PDF, JPG, JPEG, PNG (maksimal 4MB
                                                per file)
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}

                                {/* Step 4: Confirmation */}
                                {activeStep === 4 && (
                                    <>
                                        {/* Input Summary */}
                                        <div className="mx-auto mb-8 w-full max-w-2xl rounded-xl bg-white/60 p-4 sm:p-6">
                                            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                                                <FileText className="h-5 w-5 flex-shrink-0 text-blue-500" /> Ringkasan
                                                Data Pendaftaran
                                            </h3>
                                            <div className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm sm:gap-x-8 md:grid-cols-2">
                                                <div className="min-w-0">
                                                    <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                        Informasi Tim
                                                    </div>
                                                    <div className="flex justify-between border-b border-dashed border-gray-100 py-1">
                                                        <span className="truncate pr-2 text-gray-500">Nama Tim</span>
                                                        <span className="truncate text-right font-medium text-gray-900">
                                                            {form.getValues('team_name')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-dashed border-gray-100 py-1">
                                                        <span className="truncate pr-2 text-gray-500">Kota</span>
                                                        <span className="truncate text-right font-medium text-gray-900">
                                                            {form.getValues('city')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-dashed border-gray-100 py-1">
                                                        <span className="truncate pr-2 text-gray-500">
                                                            Perusahaan/Institusi
                                                        </span>
                                                        <span className="truncate text-right font-medium text-gray-900">
                                                            {form.getValues('company')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-1">
                                                        <span className="truncate pr-2 text-gray-500">Kategori</span>
                                                        <span className="truncate text-right font-medium text-gray-900">
                                                            {categories.find(
                                                                (c) =>
                                                                    c.id.toString() === form.getValues('category_id'),
                                                            )?.name || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                        Ketua Tim
                                                    </div>
                                                    <div className="flex justify-between border-b border-dashed border-gray-100 py-1">
                                                        <span className="truncate pr-2 text-gray-500">Nama</span>
                                                        <span className="truncate text-right font-medium text-gray-900">
                                                            {form.getValues('leader_name')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-dashed border-gray-100 py-1">
                                                        <span className="truncate pr-2 text-gray-500">Email</span>
                                                        <span className="truncate text-right font-medium text-gray-900">
                                                            {form.getValues('leader_email')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-1">
                                                        <span className="truncate pr-2 text-gray-500">WhatsApp</span>
                                                        <span className="truncate text-right font-medium text-gray-900">
                                                            {form.getValues('leader_whatsapp')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 md:col-span-2">
                                                    <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                        Dokumen
                                                    </div>
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                                                        <div className="flex min-w-0 items-start gap-2">
                                                            <GraduationCap className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                                                            <div className="min-w-0 flex-1">
                                                                <span className="block text-gray-500">
                                                                    Kartu Mahasiswa:
                                                                </span>
                                                                {studentCardFile ? (
                                                                    <span className="block truncate font-medium text-gray-900">
                                                                        {studentCardFile.name}{' '}
                                                                        <span className="text-xs text-gray-400">
                                                                            ({formatFileSize(studentCardFile.size)})
                                                                        </span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="block text-gray-400">
                                                                        Belum diupload
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex min-w-0 items-start gap-2">
                                                            <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                                                            <div className="min-w-0 flex-1">
                                                                <span className="block text-gray-500">
                                                                    Bukti Pembayaran:
                                                                </span>
                                                                {paymentEvidenceFile ? (
                                                                    <span className="block truncate font-medium text-gray-900">
                                                                        {paymentEvidenceFile.name}{' '}
                                                                        <span className="text-xs text-gray-400">
                                                                            ({formatFileSize(paymentEvidenceFile.size)})
                                                                        </span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="block text-gray-400">
                                                                        Belum diupload
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Confirmation Checkbox */}
                                        <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                                            <label className="flex cursor-pointer items-start space-x-3 text-center select-none sm:text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={isReadyChecked}
                                                    onChange={(e) => setIsReadyChecked(e.target.checked)}
                                                    className="form-checkbox text-primary focus:ring-primary mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300"
                                                />
                                                <span className="text-sm font-medium sm:text-base">
                                                    Saya sudah siap dan data yang saya masukkan sudah benar.
                                                </span>
                                            </label>
                                            <p className="mt-4 max-w-md text-center text-xs text-gray-500 sm:text-sm">
                                                Pastikan semua data sudah benar sebelum mengirim pendaftaran. Setelah
                                                mengirim, data tidak dapat diubah kecuali oleh admin.
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePreviousStep}
                                        disabled={activeStep === 1}
                                        className="flex w-full items-center justify-center gap-2 sm:w-auto"
                                    >
                                        Sebelumnya
                                    </Button>

                                    <div className="flex w-full items-center justify-center gap-3 sm:w-auto">
                                        {activeStep < 4 && (
                                            <Button
                                                type="button"
                                                onClick={handleNextStep}
                                                disabled={!isStepComplete(activeStep) || !teamNameUnique}
                                                className="flex w-full items-center justify-center gap-2 sm:w-auto"
                                            >
                                                Selanjutnya
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {activeStep === 4 && (
                                            <Button
                                                type="submit"
                                                disabled={
                                                    isSubmitting ||
                                                    (activeStep === 4 && !isReadyChecked) ||
                                                    !teamNameUnique
                                                }
                                                className="flex w-full items-center justify-center gap-2 px-8 sm:w-auto"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Clock className="h-4 w-4 animate-spin" />
                                                        Mendaftarkan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trophy className="h-4 w-4" />
                                                        Daftar Sekarang
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </SafeWidth>
    );
}
