import { useState, useRef, useEffect, useMemo } from "react";
import {
  Platform,
  Keyboard,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { biometricService } from "@/modules/authentication/services/biometricService";
import {
  sanitizePanInput,
  formatDobInput,
  validateField,
  validateRealTimeField,
  checkFormValidity,
} from "./createProfileValidation";
import type { SignupForm, SignupErrors } from "./types";
import { formatSignupAddress, buildRegistrationProfile } from "./createProfile.helpers";
import { toHref } from "@/shared/utils/navigation";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCreateProfile(
  currentStep: 1 | 2,
  setCurrentStep: (step: 1 | 2) => void
) {
  const router = useRouter();
  const params = useLocalSearchParams<{ customerType?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const { register, mobileNumber: storeMobileNumber } = useAuthStore();

  // ─── Field Refs ──────────────────────────────────────────────────────────────
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const dobRef = useRef<TextInput>(null);
  const fatherSpouseRef = useRef<TextInput>(null);
  const panRef = useRef<TextInput>(null);
  const aadhaarRef = useRef<TextInput>(null);
  const address1Ref = useRef<TextInput>(null);
  const address2Ref = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const pinRef = useRef<TextInput>(null);
  const passcodeRef = useRef<TextInput>(null);
  const confirmPasscodeRef = useRef<TextInput>(null);

  // ─── UI State ────────────────────────────────────────────────────────────────
  const [showAddressLine2, setShowAddressLine2] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTermsState] = useState(false);
  const setAgreedToTerms: React.Dispatch<React.SetStateAction<boolean>> = (
    valOrFn
  ) => {
    setAgreedToTermsState((prev) => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      if (next) {
        setProfileErrors((p) => {
          if (!p.terms) return p;
          const c = { ...p };
          delete c.terms;
          return c;
        });
      }
      return next;
    });
  };

  // ─── Keyboard-aware scroll ───────────────────────────────────────────────────
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const fieldYOffsets = useRef<Record<string, number>>({});
  const activeFieldKey = useRef<string | null>(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e?.endCoordinates?.height || 280;
      setKeyboardHeight(h);
      const focusedKey = activeFieldKey.current;
      focusedKey &&
        (() => {
          const y = fieldYOffsets.current[focusedKey];
          y !== undefined &&
            scrollRef.current?.scrollTo({ y: Math.max(0, y - 70), animated: true });
        })();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      activeFieldKey.current = null;
    });

    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleFieldFocus = (fieldKey: string) => {
    activeFieldKey.current = fieldKey;
    const y = fieldYOffsets.current[fieldKey];
    y !== undefined &&
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 70), animated: true });
      }, 120);
  };

  // ─── Modal State ─────────────────────────────────────────────────────────────
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState("");

  // ─── Biometric State ─────────────────────────────────────────────────────────
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricType, setBiometricType] = useState("Fingerprint");
  const [pendingPostRegistrationRoute, setPendingPostRegistrationRoute] =
    useState<string | null>(null);

  // ─── Form State ──────────────────────────────────────────────────────────────
  const autoMobile = storeMobileNumber || "";

  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    mobileNumber: autoMobile,
    gender: "",
    dob: "",
    fatherSpouseName: "",
    pan: "",
    aadhaar: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    pincode: "",
    state: "",
    password: "",
    confirmPassword: "",
    customerType: params.customerType || "Individual",
  });

  useEffect(() => {
    const requestedType = params?.customerType;
    requestedType &&
      requestedType !== form.customerType &&
      setForm((p) => ({ ...p, customerType: requestedType }));
  }, [params?.customerType]);

  useEffect(() => {
    storeMobileNumber &&
      storeMobileNumber !== form.mobileNumber &&
      setForm((p) => ({ ...p, mobileNumber: storeMobileNumber }));
  }, [storeMobileNumber]);

  // ─── PAN Keyboard Type ───────────────────────────────────────────────────────
  const panKeyboardType: "default" | "number-pad" =
    form.pan.length >= 5 && form.pan.length < 9 ? "number-pad" : "default";

  // ─── PAN Sanitizer (functional, zero loops) ──────────────────────────────────
  const handlePanChange = (text: string) => {
    updateForm("pan", sanitizePanInput(text, form.pan));
  };

  // ─── Form Update with Real-Time Validation ──────────────────────────────────
  const updateForm = (key: keyof SignupForm, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));

    const updatedForm = { ...form, [key]: val };
    const err = validateRealTimeField(
      key,
      val,
      updatedForm,
      updatedForm.mobileNumber || storeMobileNumber
    );

    setProfileErrors((prev) => {
      const next = { ...prev };
      if (err) {
        next[key] = err;
      } else {
        delete next[key];
      }
      // Passcode match real-time synchronization
      if (key === "password" && updatedForm.confirmPassword) {
        if (val === updatedForm.confirmPassword) {
          delete next.confirmPassword;
        } else if (updatedForm.confirmPassword.length === 6) {
          next.confirmPassword = "Passcodes do not match";
        }
      } else if (key === "confirmPassword" && updatedForm.password) {
        if (val === updatedForm.password) {
          delete next.confirmPassword;
        } else if (val.length === 6) {
          next.confirmPassword = "Passcodes do not match";
        }
      }
      return next;
    });
  };

  const handleBlur = (key: keyof SignupForm) => {
    const val = form[key];
    if (val && val.trim().length > 0) {
      const err = validateField(
        key,
        val,
        form.mobileNumber || storeMobileNumber,
        form.password
      );
      if (err) setProfileErrors((p) => ({ ...p, [key]: err }));
    }
  };

  // ─── DOB Handler ─────────────────────────────────────────────────────────────
  const handleDobChange = (text: string) => {
    updateForm("dob", text);
  };

  // ─── Form Validity (memoized) ────────────────────────────────────────────────
  const isFormValid = useMemo(() => {
    return checkFormValidity(
      form,
      agreedToTerms,
      form.mobileNumber || storeMobileNumber
    );
  }, [form, agreedToTerms, storeMobileNumber]);

  // ─── Step Navigation ─────────────────────────────────────────────────────────
  const handleProceedToRegistration = () => {
    !form.customerType
      ? Alert.alert("Account Type Required", "Please select an account type.")
      : (setCurrentStep(2), scrollRef.current?.scrollTo({ y: 0, animated: true }));
  };

  const handleBack = () => {
    currentStep === 2
      ? (setCurrentStep(1), scrollRef.current?.scrollTo({ y: 0, animated: true }))
      : router.back();
  };

  // ─── Registration API Call ───────────────────────────────────────────────────
  const executeRegistrationRequest = async () => {
    setProfileLoading(true);

    const fullAddress = formatSignupAddress(form);

    try {
      const res = await register(
        buildRegistrationProfile(form, fullAddress, storeMobileNumber),
        form.password.trim(),
        true
      );

      setProfileLoading(false);
      res.success
        ? (async () => {
            const pendingRoute = useAuthStore.getState().pendingServiceRoute;
            useAuthStore.getState().setPendingServiceRoute(null);
            const destination = pendingRoute || "/(main)/home";
            try {
              const hasHardware = await biometricService.checkHardwareSupport();
              const isEnrolled = await biometricService.checkEnrollment();
              const isAlreadyEnabled = await biometricService.isBiometricEnabled();
              hasHardware && isEnrolled && !isAlreadyEnabled
                ? (async () => {
                    const typeLabel = await biometricService.getBiometricTypeLabel();
                    setBiometricType(typeLabel);
                    setPendingPostRegistrationRoute(destination);
                    setShowBiometricModal(true);
                  })()
                : router.replace(toHref(destination));
              return;
            } catch (bioCheckErr) {
              logger.warn("Biometric check error during registration", { error: getErrorMessage(bioCheckErr) });
            }
            router.replace(toHref(destination));
          })()
        : Alert.alert("Registration Error", res.error || "Failed to create account. Please try again.");
    } catch (err) {
      setProfileLoading(false);
      Alert.alert("Registration Error", getErrorMessage(err) || "An unexpected error occurred during registration.");
    }
  };

  // ─── Submit with Validation ──────────────────────────────────────────────────
  const fieldOrder: { key: keyof SignupForm; ref?: React.RefObject<TextInput | null> }[] = [
    { key: "name", ref: nameRef },
    { key: "email", ref: emailRef },
    { key: "gender" },
    { key: "dob", ref: dobRef },
    { key: "fatherSpouseName", ref: fatherSpouseRef },
    { key: "pan", ref: panRef },
    { key: "aadhaar", ref: aadhaarRef },
    { key: "addressLine1", ref: address1Ref },
    { key: "city", ref: cityRef },
    { key: "pincode", ref: pinRef },
    { key: "state" },
    { key: "password", ref: passcodeRef },
    { key: "confirmPassword", ref: confirmPasscodeRef },
  ];

  const submitValidatedForm = () => {
    const errs: SignupErrors = fieldOrder.reduce<SignupErrors>(
      (acc, item) => {
        const err = validateField(
          item.key,
          form[item.key],
          form.mobileNumber || storeMobileNumber,
          form.password
        );
        return err ? { ...acc, [item.key]: err } : acc;
      },
      agreedToTerms
        ? {}
        : { terms: "Please accept the Terms of Service and Privacy Policy to continue." }
    );

    const hasErrors = Object.keys(errs).length > 0;
    hasErrors
      ? (() => {
          setProfileErrors(errs);
          const firstInvalid = fieldOrder.find((item) => Boolean(errs[item.key]));
          firstInvalid
            ? (() => {
                const y = fieldYOffsets.current[firstInvalid.key];
                y !== undefined &&
                  scrollRef.current?.scrollTo({ y: Math.max(0, y - 70), animated: true });
                firstInvalid.ref?.current &&
                  setTimeout(() => firstInvalid.ref?.current?.focus(), 150);
              })()
            : errs.terms
              ? scrollRef.current?.scrollToEnd({ animated: true })
              : undefined;
        })()
      : executeRegistrationRequest();
  };

  const handleFinalRegistration = async () => {
    !form.customerType
      ? (Alert.alert("Account Type Required", "Please select an account type."), setCurrentStep(1))
      : submitValidatedForm();
  };

  // ─── Biometric Handlers ──────────────────────────────────────────────────────
  const handleEnableBiometric = async () => {
    setShowBiometricModal(false);
    try {
      const authRes = await biometricService.authenticate();
      authRes.success && (await useAuthStore.getState().setBiometricEnabled(true));
    } catch (bioAuthErr) {
      logger.warn("Biometric authentication error", { error: getErrorMessage(bioAuthErr) });
    }
    router.replace(toHref(pendingPostRegistrationRoute || "/(main)/home"));
  };

  const handleNotNowBiometric = () => {
    setShowBiometricModal(false);
    router.replace(toHref(pendingPostRegistrationRoute || "/(main)/home"));
  };

  // ─── Field Offset Setter (kept inside hook to satisfy React compiler) ─────────
  const setFieldOffset = (key: string, y: number) => {
    fieldYOffsets.current[key] = y;
  };

  // ─── Return ──────────────────────────────────────────────────────────────────
  return {
    form,
    updateForm,
    handlePanChange,
    handleDobChange,
    handleBlur,
    profileErrors,
    profileLoading,
    isFormValid,
    handleProceedToRegistration,
    handleFinalRegistration,
    handleBack,
    panKeyboardType,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    agreedToTerms,
    setAgreedToTerms,
    showAddressLine2,
    setShowAddressLine2,
    keyboardHeight,
    setFieldOffset,
    handleFieldFocus,
    scrollRef,
    nameRef,
    emailRef,
    dobRef,
    fatherSpouseRef,
    panRef,
    aadhaarRef,
    address1Ref,
    address2Ref,
    cityRef,
    pinRef,
    passcodeRef,
    confirmPasscodeRef,
    showGenderModal,
    setShowGenderModal,
    showStateModal,
    setShowStateModal,
    stateSearchQuery,
    setStateSearchQuery,
    showBiometricModal,
    biometricType,
    handleEnableBiometric,
    handleNotNowBiometric,
  };
}
