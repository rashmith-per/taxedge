import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  LayoutAnimation,
  Keyboard,
  BackHandler,
  type TextInputProps,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../../hooks/use-theme";
import { BrandColors, Colors, BorderWidth, Spacing } from "../../shared/theme";
import { useAuthStore } from "../../store/authStore";
import { validatePasscode } from "../../modules/authentication/validation/authSchema";
import { biometricService } from "../../modules/authentication/services/biometricService";
import { BiometricPromptModal } from "../../shared/components/BiometricPromptModal";
import { styles } from "../../styles/app/(auth)/create-profile.styles";
import type { IconName } from "../../types/domain";
import {
  validateDateOfBirth,
  validateEmail,
  validateFullName,
} from "../../shared/validators/indianTaxValidators";

const HEADER_INSET_TOP_OFFSET = Spacing.sm; // 8
const MIN_HEADER_TOP = Spacing.xl; // 24

interface SignupForm {
  name: string;
  email: string;
  mobileNumber: string;
  gender: string;
  dob: string;
  fatherSpouseName: string;
  pan: string;
  aadhaar: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  state: string;
  password: string;
  confirmPassword: string;
  customerType: string;
}

type SignupErrors = Partial<Record<keyof SignupForm | "terms", string>>;

interface CustomerTypeOption {
  key: string;
  title: string;
  subtitle: string;
  icon: IconName;
}

const CUSTOMER_TYPE_OPTIONS: CustomerTypeOption[] = [
  {
    key: "Individual",
    title: "Individual",
    subtitle: "Salaried professionals & individual taxpayers",
    icon: "person-outline",
  },
  {
    key: "Proprietorship",
    title: "Proprietorship",
    subtitle: "Single-owner business entities & local shops",
    icon: "storefront-outline",
  },
  {
    key: "Partnership",
    title: "Partnership",
    subtitle: "Registered partnership firms with 2+ partners",
    icon: "people-outline",
  },
  {
    key: "LLP",
    title: "LLP",
    subtitle: "Limited Liability Partnership firms",
    icon: "shield-checkmark-outline",
  },
  {
    key: "Private Limited",
    title: "Private Limited",
    subtitle: "Pvt Ltd companies & scalable startups",
    icon: "business-outline",
  },
  {
    key: "Public Limited",
    title: "Public Limited",
    subtitle: "Publicly traded or listed corporations",
    icon: "podium-outline",
  },
  {
    key: "HUF",
    title: "HUF",
    subtitle: "Hindu Undivided Family tax units",
    icon: "home-outline",
  },
  {
    key: "AOP / BOI",
    title: "AOP / BOI",
    subtitle: "Association of Persons or Body of Individuals",
    icon: "layers-outline",
  },
  {
    key: "Freelancer",
    title: "Freelancer",
    subtitle: "Independent contractors, gig workers & consultants",
    icon: "laptop-outline",
  },
  {
    key: "NGO / Trust",
    title: "NGO / Trust",
    subtitle: "Non-profit entities, trusts & societies",
    icon: "heart-outline",
  },
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function CreateProfileScreen() {
  const colors = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ customerType?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const { register, mobileNumber: storeMobileNumber } = useAuthStore();

  // 2-Step Navigation: Step 1 = Type of User (Account Type), Step 2 = Full Registration Form
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Hardware Back Button listener for Android: Step 2 returns to Step 1
  useEffect(() => {
    const onBackPress = () => {
      if (currentStep === 2) {
        setCurrentStep(1);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [currentStep]);

  // Input Refs for smooth keyboard navigation
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

  // Expandable Address Line 2 state
  const [showAddressLine2, setShowAddressLine2] = useState(false);

  // Form states
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Keyboard and focused field tracking for keyboard-aware scrolling
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const fieldYOffsets = useRef<Record<string, number>>({});
  const activeFieldKey = useRef<string | null>(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e?.endCoordinates?.height || 280;
      setKeyboardHeight(h);
      if (activeFieldKey.current) {
        const y = fieldYOffsets.current[activeFieldKey.current];
        if (y !== undefined) {
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - 70),
            animated: true,
          });
        }
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      activeFieldKey.current = null;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleFieldFocus = (fieldKey: string) => {
    activeFieldKey.current = fieldKey;
    const y = fieldYOffsets.current[fieldKey];
    if (y !== undefined) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - 70),
          animated: true,
        });
      }, 120);
    }
  };

  // Modals
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState("");

  // Biometric prompt state
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricType, setBiometricType] = useState("Fingerprint");
  const [pendingPostRegistrationRoute, setPendingPostRegistrationRoute] = useState<string | null>(null);

  // Calendar states
  const [pickerYear, setPickerYear] = useState(2000);
  const [pickerMonth, setPickerMonth] = useState(0);
  const [pickerDay, setPickerDay] = useState(1);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

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
    if (params?.customerType && params.customerType !== form.customerType) {
      setForm((p) => ({ ...p, customerType: params.customerType! }));
    }
  }, [params?.customerType]);

  useEffect(() => {
    if (storeMobileNumber && storeMobileNumber !== form.mobileNumber) {
      setForm((p) => ({ ...p, mobileNumber: storeMobileNumber }));
    }
  }, [storeMobileNumber]);

  // Dynamic PAN Keyboard: Chars 1-5 -> Alphabet, Chars 6-9 -> Numeric, Char 10 -> Alphabet
  const panKeyboardType = useMemo((): "default" | "number-pad" => {
    const len = form.pan.length;
    if (len >= 5 && len < 9) {
      return "number-pad";
    }
    return "default";
  }, [form.pan]);

  // PAN Character-by-character Input Controller
  const handlePanChange = (text: string) => {
    const clean = text.toUpperCase().replace(/\s+/g, "");

    // Allow backspace / character deletion
    if (clean.length < form.pan.length && form.pan.startsWith(clean)) {
      updateForm("pan", clean);
      return;
    }

    let sanitized = "";
    for (let i = 0; i < clean.length && i < 10; i++) {
      const ch = clean[i];
      if (i < 5) {
        // Positions 0..4 (chars 1-5): Letters only [A-Z]
        if (/[A-Z]/.test(ch)) {
          sanitized += ch;
        } else {
          break;
        }
      } else if (i < 9) {
        // Positions 5..8 (chars 6-9): Numbers only [0-9]
        if (/[0-9]/.test(ch)) {
          sanitized += ch;
        } else {
          break;
        }
      } else if (i === 9) {
        // Position 9 (char 10): Letter only [A-Z]
        if (/[A-Z]/.test(ch)) {
          sanitized += ch;
        } else {
          break;
        }
      }
    }

    updateForm("pan", sanitized);
  };

  const updateForm = (key: keyof SignupForm, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));

    if (profileErrors[key]) {
      setProfileErrors((p) => ({ ...p, [key]: "" }));
    }

    if (key === "pan") {
      const clean = val.trim().toUpperCase();
      if (clean.length === 10) {
        setProfileErrors((p) => ({
          ...p,
          pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(clean) ? "" : "Invalid PAN",
        }));
      }
    } else if (key === "aadhaar") {
      const clean = val.replace(/\D/g, "");
      if (clean.length === 12) {
        setProfileErrors((p) => ({
          ...p,
          aadhaar: /^[2-9]{1}[0-9]{11}$/.test(clean) ? "" : "Invalid Aadhaar",
        }));
      }
    } else if (key === "pincode") {
      const clean = val.replace(/\D/g, "");
      if (clean.length === 6) {
        setProfileErrors((p) => ({ ...p, pincode: "" }));
      }
    } else if (key === "password" || key === "confirmPassword") {
      const activeMobile = form.mobileNumber || storeMobileNumber;
      if (key === "password") {
        const clean = val.replace(/\D/g, "");
        if (clean.length === 6) {
          const v = validatePasscode(clean, activeMobile);
          setProfileErrors((p) => ({
            ...p,
            password: v.valid ? "" : (v.error || "Invalid passcode"),
          }));
        } else {
          setProfileErrors((p) => ({ ...p, password: "" }));
        }
        if (form.confirmPassword) {
          setProfileErrors((p) => ({
            ...p,
            confirmPassword: val === form.confirmPassword ? "" : "Passcodes do not match",
          }));
        }
      } else if (key === "confirmPassword" && form.password) {
        setProfileErrors((p) => ({
          ...p,
          confirmPassword: val === form.password ? "" : "Passcodes do not match",
        }));
      }
    }
  };

  const validateField = (key: keyof SignupForm, val: string): string => {
    switch (key) {
      case "name":
        if (!val.trim()) return "Required";
        return validateFullName(val) ? "" : "Enter a valid full name";
      case "email": {
        const clean = val.trim();
        if (!clean) return "Required";
        if (!validateEmail(clean)) {
          return "Invalid email";
        }
        return "";
      }
      case "gender":
        return val ? "" : "Required";
      case "dob": {
        const clean = val.trim();
        if (!clean) return "Required";
        if (!validateDateOfBirth(clean)) return "Please enter a valid date of birth.";
        return "";
      }
      case "fatherSpouseName":
        return val.trim() ? "" : "Required";
      case "pan": {
        const clean = val.trim().toUpperCase();
        if (!clean) return "Required";
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(clean)) {
          return "Invalid PAN";
        }
        return "";
      }
      case "aadhaar": {
        const clean = val.replace(/\D/g, "");
        if (!clean) return "Required";
        if (clean.length !== 12 || !/^[2-9]{1}[0-9]{11}$/.test(clean)) {
          return "Invalid Aadhaar";
        }
        return "";
      }
      case "addressLine1":
        return val.trim() ? "" : "Required";
      case "city":
        return val.trim() ? "" : "Required";
      case "pincode": {
        const clean = val.replace(/\D/g, "");
        if (!clean) return "Required";
        if (clean.length !== 6) return "PIN Code must be 6 digits";
        return "";
      }
      case "state":
        return val ? "" : "Required";
      case "password": {
        if (!val) return "Required";
        if (val.length < 6) return "Passcode must be 6 digits";
        const v = validatePasscode(val, form.mobileNumber || storeMobileNumber);
        if (!v.valid) return v.error || "Invalid passcode";
        return "";
      }
      case "confirmPassword": {
        if (!val) return "Required";
        if (val !== form.password) return "Passcodes do not match";
        return "";
      }
      case "customerType":
        return val ? "" : "Required";
      default:
        return "";
    }
  };

  const handleBlur = (key: keyof SignupForm) => {
    const val = form[key];
    if (val && val.trim().length > 0) {
      const err = validateField(key, val);
      if (err) {
        setProfileErrors((p) => ({ ...p, [key]: err }));
      }
    }
  };

  const handleDobChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    }
    updateForm("dob", formatted);
  };

  const openCalendarModal = () => {
    if (form.dob) {
      const parts = form.dob.split("-");
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y >= 1930 && y <= 2030) {
          setPickerDay(d);
          setPickerMonth(m);
          setPickerYear(y);
        }
      }
    }
    setShowDatePicker(true);
  };

  const confirmCalendarDate = () => {
    const dayStr = String(pickerDay).padStart(2, "0");
    const monthStr = String(pickerMonth + 1).padStart(2, "0");
    const yearStr = String(pickerYear);
    updateForm("dob", `${dayStr}-${monthStr}-${yearStr}`);
    setShowDatePicker(false);
    setTimeout(() => fatherSpouseRef.current?.focus(), 150);
  };

  // Screen 1: Complete Form Validity Check for Continue button
  const isScreen1Valid = useMemo(() => {
    const hasName = validateFullName(form.name);
    const hasEmail = validateEmail(form.email);
    const hasGender = Boolean(form.gender);
    const hasDob = validateDateOfBirth(form.dob);
    const hasFatherSpouse = Boolean(form.fatherSpouseName.trim());
    const hasPan = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
      form.pan.trim().toUpperCase()
    );
    const hasAadhaar = /^[2-9]{1}[0-9]{11}$/.test(
      form.aadhaar.replace(/\D/g, "")
    );
    const hasAddress1 = Boolean(form.addressLine1.trim());
    const hasCity = Boolean(form.city.trim());
    const hasPincode = form.pincode.replace(/\D/g, "").length === 6;
    const hasState = Boolean(form.state);
    const hasPasscode =
      validatePasscode(form.password, form.mobileNumber || storeMobileNumber).valid;
    const hasConfirmPasscode =
      form.confirmPassword === form.password && form.confirmPassword.length === 6;

    return (
      hasName &&
      hasEmail &&
      hasGender &&
      hasDob &&
      hasFatherSpouse &&
      hasPan &&
      hasAadhaar &&
      hasAddress1 &&
      hasCity &&
      hasPincode &&
      hasState &&
      hasPasscode &&
      hasConfirmPasscode &&
      agreedToTerms
    );
  }, [form, agreedToTerms]);

  // Navigate from Step 1 (Select Account Type) to Step 2 (Registration Form)
  const handleProceedToRegistration = () => {
    if (!form.customerType) {
      Alert.alert("Account Type Required", "Please select an account type.");
      return;
    }

    setCurrentStep(2);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Step 2: Submit Full Registration Payload to Backend
  const handleFinalRegistration = async () => {
    if (!form.customerType) {
      Alert.alert("Account Type Required", "Please select an account type.");
      setCurrentStep(1);
      return;
    }

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

    const errs: SignupErrors = {};
    for (const item of fieldOrder) {
      const err = validateField(item.key, form[item.key]);
      if (err) {
        errs[item.key] = err;
      }
    }

    if (!agreedToTerms) {
      errs.terms = "Please accept the Terms of Service and Privacy Policy to continue.";
    }

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      const firstInvalid = fieldOrder.find((item) => Boolean(errs[item.key]));
      if (firstInvalid) {
        const y = fieldYOffsets.current[firstInvalid.key];
        if (y !== undefined) {
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - 70),
            animated: true,
          });
        }
        if (firstInvalid.ref?.current) {
          setTimeout(() => {
            firstInvalid.ref?.current?.focus();
          }, 150);
        }
      } else if (errs.terms) {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
      return;
    }

    setProfileLoading(true);

    const fullAddress = [
      form.addressLine1.trim(),
      form.addressLine2.trim(),
      form.city.trim(),
      form.state.trim()
        ? `${form.state.trim()} - ${form.pincode.trim()}`
        : form.pincode.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const res = await register(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          customerType: form.customerType,
          dob: form.dob.trim(),
          gender: form.gender,
          fatherSpouseName: form.fatherSpouseName.trim(),
          pan: form.pan.trim().toUpperCase(),
          aadhaar: form.aadhaar.replace(/\D/g, ""),
          address: fullAddress,
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          pincode: form.pincode.trim(),
          state: form.state.trim(),
          mobileNumber: form.mobileNumber || storeMobileNumber,
        } as any,
        form.password.trim(),
        true
      );

      setProfileLoading(false);
      if (res.success) {
        const pendingRoute = useAuthStore.getState().pendingServiceRoute;
        useAuthStore.getState().setPendingServiceRoute(null);
        const destination = pendingRoute || "/(main)/home";

        try {
          const hasHardware = await biometricService.checkHardwareSupport();
          const isEnrolled = await biometricService.checkEnrollment();
          const isAlreadyEnabled = await biometricService.isBiometricEnabled();

          if (hasHardware && isEnrolled && !isAlreadyEnabled) {
            const typeLabel = await biometricService.getBiometricTypeLabel();
            setBiometricType(typeLabel);
            setPendingPostRegistrationRoute(destination);
            setShowBiometricModal(true);
            return;
          }
        } catch {}

        router.replace(destination as any);
      } else {
        Alert.alert(
          "Registration Error",
          res.error || "Failed to create account. Please try again."
        );
      }
    } catch (err: any) {
      setProfileLoading(false);
      Alert.alert(
        "Registration Error",
        err?.message || "An unexpected error occurred during registration."
      );
    }
  };

  const handleEnableBiometric = async () => {
    setShowBiometricModal(false);
    try {
      const authRes = await biometricService.authenticate();
      if (authRes.success) {
        await useAuthStore.getState().setBiometricEnabled(true);
      }
    } catch {}
    const destination = pendingPostRegistrationRoute || "/(main)/home";
    router.replace(destination as any);
  };

  const handleNotNowBiometric = () => {
    setShowBiometricModal(false);
    const destination = pendingPostRegistrationRoute || "/(main)/home";
    router.replace(destination as any);
  };

  // Back Button handler
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  // Filtered Indian States
  const filteredStates = useMemo(() => {
    if (!stateSearchQuery.trim()) return INDIAN_STATES_AND_UTS;
    const q = stateSearchQuery.toLowerCase();
    return INDIAN_STATES_AND_UTS.filter((s) => s.toLowerCase().includes(q));
  }, [stateSearchQuery]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      style={[styles.container, { backgroundColor: BrandColors.BACKGROUND }]}
    >
      {/* Top Wave Header */}
      <View style={styles.waveHeaderWrapper}>
        <Svg
          height={150}
          width="100%"
          viewBox="0 0 375 150"
          style={StyleSheet.absoluteFill}
          preserveAspectRatio="none"
        >
          <Path
            d="M0,0 L375,0 L375,100 C310,140 230,135 140,115 C60,95 20,110 0,120 Z"
            fill={BrandColors.PRIMARY_BLUE_DARK}
          />
          <Path
            d="M260,0 C295,35 335,55 375,58 L375,0 Z"
            fill={BrandColors.PRIMARY_ORANGE}
          />
        </Svg>

        <View
          style={[
            styles.waveHeaderContent,
            { paddingTop: Math.max(insets.top + HEADER_INSET_TOP_OFFSET, MIN_HEADER_TOP) },
          ]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBack}
              style={styles.backBtnWhite}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={24} color={BrandColors.WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitleWhite}>
              {currentStep === 1 ? "Select Account Type" : "Create Account"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={currentStep === 1 ? { flex: 1 } : undefined}
        contentContainerStyle={[
          styles.profileScroll,
          {
            paddingBottom:
              currentStep === 1
                ? Spacing.base
                : keyboardHeight > 0
                ? keyboardHeight + (Platform.OS === "android" ? 100 : 60)
                : Math.max(insets.bottom + Spacing.xl, 40),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* ============================================================= */}
        {/* STEP 1: TYPE OF USER / ACCOUNT TYPE SELECTION                 */}
        {/* ============================================================= */}
        {currentStep === 1 && (
          <View style={styles.customerTypeContainer}>
            {/* 10 Modern Customer Type Option Cards */}
            {CUSTOMER_TYPE_OPTIONS.map((opt) => {
              const isSelected = form.customerType === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.8}
                  onPress={() => updateForm("customerType", opt.key)}
                  style={[
                    styles.customerTypeCard,
                    isSelected && styles.customerTypeCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.cardIconContainer,
                      isSelected && styles.cardIconContainerSelected,
                    ]}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={22}
                      color={
                        isSelected
                          ? BrandColors.PRIMARY_ORANGE
                          : BrandColors.PRIMARY_BLUE
                      }
                    />
                  </View>

                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        styles.cardTitle,
                        isSelected && styles.cardTitleSelected,
                      ]}
                    >
                      {opt.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={BrandColors.WHITE}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ============================================================= */}
        {/* STEP 2: COMPLETE REGISTRATION FORM (ONE SCROLLABLE PAGE)       */}
        {/* ============================================================= */}
        {currentStep === 2 && (
          <View style={styles.formSection}>
            {/* Selected Account Type Badge */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setCurrentStep(1);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#EFF6FF",
                borderWidth: 1,
                borderColor: "#BFDBFE",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="briefcase-outline" size={20} color={BrandColors.PRIMARY_BLUE} />
                <View>
                  <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>
                    Account Type
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: BrandColors.PRIMARY_BLUE_DARK }}>
                    {form.customerType || "Individual"}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: BrandColors.PRIMARY_ORANGE }}>
                  Change
                </Text>
                <Ionicons name="chevron-forward" size={14} color={BrandColors.PRIMARY_ORANGE} />
              </View>
            </TouchableOpacity>

            {/* Full Name */}
            <Field
              ref={nameRef}
              containerOnLayout={(e) => {
                fieldYOffsets.current["name"] = e.nativeEvent.layout.y;
              }}
              label="Full Name"
              leftIcon="person-outline"
              value={form.name}
              onChangeText={(t) => updateForm("name", t)}
              onFocus={() => handleFieldFocus("name")}
              onBlur={() => handleBlur("name")}
              placeholder="Full Name"
              error={profileErrors.name}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            {/* Email */}
            <Field
              ref={emailRef}
              containerOnLayout={(e) => {
                fieldYOffsets.current["email"] = e.nativeEvent.layout.y;
              }}
              label="Email"
              leftIcon="mail-outline"
              value={form.email}
              onChangeText={(t) => updateForm("email", t)}
              onFocus={() => handleFieldFocus("email")}
              onBlur={() => handleBlur("email")}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={profileErrors.email}
              returnKeyType="next"
              onSubmitEditing={() => setShowGenderModal(true)}
            />

            {/* Gender */}
            <View
              style={styles.fieldContainer}
              onLayout={(e) => {
                fieldYOffsets.current["gender"] = e.nativeEvent.layout.y;
              }}
            >
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowGenderModal(true);
                }}
                style={[
                  styles.inputBox,
                  profileErrors.gender
                    ? {
                        borderColor: Colors.error,
                        backgroundColor: "#FEF2F2",
                        borderWidth: BorderWidth.regular,
                      }
                    : {
                        borderColor: BrandColors.BORDER,
                        borderWidth: BorderWidth.thin,
                      },
                ]}
              >
                <Ionicons
                  name="transgender-outline"
                  size={20}
                  color={profileErrors.gender ? Colors.error : BrandColors.PRIMARY_ORANGE}
                  style={styles.leftIcon}
                />
                <Text
                  style={[
                    styles.dropdownText,
                    !form.gender && { color: BrandColors.TEXT_MUTED },
                  ]}
                >
                  {form.gender || "Gender"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={BrandColors.TEXT_SECONDARY}
                  style={styles.rightIcon}
                />
              </TouchableOpacity>
              {profileErrors.gender ? (
                <Text style={styles.errorText}>{profileErrors.gender}</Text>
              ) : null}
            </View>

            {/* Date of Birth */}
            <Field
              ref={dobRef}
              containerOnLayout={(e) => {
                fieldYOffsets.current["dob"] = e.nativeEvent.layout.y;
              }}
              label="Date of Birth"
              leftIcon="calendar-outline"
              value={form.dob}
              onChangeText={handleDobChange}
              onFocus={() => handleFieldFocus("dob")}
              placeholder="DD-MM-YYYY"
              keyboardType="number-pad"
              maxLength={10}
              rightIcon="calendar-outline"
              onRightIconPress={openCalendarModal}
              error={profileErrors.dob}
              returnKeyType="next"
              onSubmitEditing={() => fatherSpouseRef.current?.focus()}
            />

            {/* Father's / Spouse Name */}
            <Field
              ref={fatherSpouseRef}
              containerOnLayout={(e) => {
                fieldYOffsets.current["fatherSpouseName"] = e.nativeEvent.layout.y;
              }}
              label="Father's / Spouse Name"
              leftIcon="people-outline"
              value={form.fatherSpouseName}
              onChangeText={(t) => updateForm("fatherSpouseName", t)}
              onFocus={() => handleFieldFocus("fatherSpouseName")}
              onBlur={() => handleBlur("fatherSpouseName")}
              placeholder="Father's / Spouse Name"
              error={profileErrors.fatherSpouseName}
              returnKeyType="next"
              onSubmitEditing={() => panRef.current?.focus()}
            />

            {/* PAN Number */}
            <Field
              ref={panRef}
              containerOnLayout={(e) => {
                fieldYOffsets.current["pan"] = e.nativeEvent.layout.y;
              }}
              label="PAN Number"
              leftIcon="card-outline"
              value={form.pan}
              onChangeText={handlePanChange}
              onFocus={() => handleFieldFocus("pan")}
              onBlur={() => handleBlur("pan")}
              placeholder="PAN Number"
              autoCapitalize="characters"
              keyboardType={panKeyboardType}
              maxLength={10}
              error={profileErrors.pan}
              returnKeyType="next"
              onSubmitEditing={() => aadhaarRef.current?.focus()}
            />

            {/* Aadhaar Number */}
            <Field
              ref={aadhaarRef}
              containerOnLayout={(e) => {
                fieldYOffsets.current["aadhaar"] = e.nativeEvent.layout.y;
              }}
              label="Aadhaar Number"
              leftIcon="newspaper-outline"
              value={form.aadhaar}
              onChangeText={(t) =>
                updateForm("aadhaar", t.replace(/\D/g, "").slice(0, 12))
              }
              onFocus={() => handleFieldFocus("aadhaar")}
              onBlur={() => handleBlur("aadhaar")}
              placeholder="Aadhaar Number"
              keyboardType="number-pad"
              maxLength={12}
              error={profileErrors.aadhaar}
              returnKeyType="next"
              onSubmitEditing={() => address1Ref.current?.focus()}
            />

            {/* Address Line 1 */}
            <Field
              ref={address1Ref}
              containerOnLayout={(e) => {
                fieldYOffsets.current["addressLine1"] = e.nativeEvent.layout.y;
              }}
              label="Address Line 1 *"
              labelRightElement={
                !showAddressLine2 ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut
                      );
                      setShowAddressLine2(true);
                      setTimeout(() => address2Ref.current?.focus(), 150);
                    }}
                    style={styles.addAddressLineBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="add"
                      size={16}
                      color={BrandColors.PRIMARY_ORANGE}
                    />
                    <Text style={styles.addAddressLineBtnText}>Add Line 2</Text>
                  </TouchableOpacity>
                ) : null
              }
              leftIcon="home-outline"
              value={form.addressLine1}
              onChangeText={(t) => updateForm("addressLine1", t)}
              onFocus={() => handleFieldFocus("addressLine1")}
              onBlur={() => handleBlur("addressLine1")}
              placeholder="House / Building / Street"
              error={profileErrors.addressLine1}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (showAddressLine2) {
                  address2Ref.current?.focus();
                } else {
                  cityRef.current?.focus();
                }
              }}
            />

            {/* Address Line 2 (Only if expanded) */}
            {showAddressLine2 && (
              <Field
                ref={address2Ref}
                label="Address Line 2 (Optional)"
                leftIcon="location-outline"
                value={form.addressLine2}
                onChangeText={(t) => updateForm("addressLine2", t)}
                onFocus={() => handleFieldFocus("addressLine2")}
                placeholder="Locality, Landmark"
                returnKeyType="next"
                onSubmitEditing={() => cityRef.current?.focus()}
              />
            )}

            {/* City & PIN Code (Side by side on the same row) */}
            <View
              style={styles.cityPinRow}
              onLayout={(e) => {
                fieldYOffsets.current["city"] = e.nativeEvent.layout.y;
                fieldYOffsets.current["pincode"] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.cityCol}>
                <Field
                  ref={cityRef}
                  label="City"
                  leftIcon="business-outline"
                  value={form.city}
                  onChangeText={(t) => updateForm("city", t)}
                  onFocus={() => handleFieldFocus("city")}
                  onBlur={() => handleBlur("city")}
                  placeholder="City"
                  error={profileErrors.city}
                  returnKeyType="next"
                  onSubmitEditing={() => pinRef.current?.focus()}
                />
              </View>

              <View style={styles.pinCol}>
                <Field
                  ref={pinRef}
                  label="PIN Code"
                  leftIcon="pin-outline"
                  value={form.pincode}
                  onChangeText={(t) =>
                    updateForm("pincode", t.replace(/\D/g, "").slice(0, 6))
                  }
                  onFocus={() => handleFieldFocus("pincode")}
                  onBlur={() => handleBlur("pincode")}
                  placeholder="PIN Code"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={profileErrors.pincode}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    setStateSearchQuery("");
                    setShowStateModal(true);
                  }}
                />
              </View>
            </View>

            {/* State / UT */}
            <View
              style={styles.fieldContainer}
              onLayout={(e) => {
                fieldYOffsets.current["state"] = e.nativeEvent.layout.y;
              }}
            >
              <Text style={styles.label}>State / UT</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Keyboard.dismiss();
                  setStateSearchQuery("");
                  setShowStateModal(true);
                }}
                style={[
                  styles.inputBox,
                  profileErrors.state
                    ? {
                        borderColor: Colors.error,
                        backgroundColor: "#FEF2F2",
                        borderWidth: BorderWidth.regular,
                      }
                    : {
                        borderColor: BrandColors.BORDER,
                        borderWidth: BorderWidth.thin,
                      },
                ]}
              >
                <Ionicons
                  name="map-outline"
                  size={20}
                  color={profileErrors.state ? Colors.error : BrandColors.PRIMARY_ORANGE}
                  style={styles.leftIcon}
                />
                <Text
                  style={[
                    styles.dropdownText,
                    !form.state && { color: BrandColors.TEXT_MUTED },
                  ]}
                >
                  {form.state || "State / UT"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={BrandColors.TEXT_SECONDARY}
                  style={styles.rightIcon}
                />
              </TouchableOpacity>
              {profileErrors.state ? (
                <Text style={styles.errorText}>{profileErrors.state}</Text>
              ) : null}
            </View>

            {/* Passcode */}
            <Field
              ref={passcodeRef}
              containerOnLayout={(e) => {
                fieldYOffsets.current["password"] = e.nativeEvent.layout.y;
              }}
              label="Passcode"
              leftIcon="lock-closed-outline"
              value={form.password}
              onChangeText={(t) =>
                updateForm("password", t.replace(/\D/g, "").slice(0, 6))
              }
              onFocus={() => handleFieldFocus("password")}
              onBlur={() => handleBlur("password")}
              placeholder="Passcode"
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              error={profileErrors.password}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasscodeRef.current?.focus()}
            />

            {/* Confirm Passcode */}
            <Field
              ref={confirmPasscodeRef}
              containerOnLayout={(e) => {
                fieldYOffsets.current["confirmPassword"] = e.nativeEvent.layout.y;
              }}
              label="Confirm Passcode"
              leftIcon="lock-closed-outline"
              value={form.confirmPassword}
              onChangeText={(t) =>
                updateForm("confirmPassword", t.replace(/\D/g, "").slice(0, 6))
              }
              onFocus={() => handleFieldFocus("confirmPassword")}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Confirm Passcode"
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry={!showConfirmPassword}
              rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
              error={profileErrors.confirmPassword}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            {/* Terms Checkbox */}
            <View
              style={styles.termsRow}
              onLayout={(e) => {
                fieldYOffsets.current["terms"] = e.nativeEvent.layout.y;
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setAgreedToTerms((prev) => !prev);
                  if (profileErrors.terms) {
                    setProfileErrors((p) => ({ ...p, terms: "" }));
                  }
                }}
                style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxChecked,
                  profileErrors.terms
                    ? { borderColor: Colors.error, borderWidth: 2 }
                    : null,
                ]}
              >
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={16} color={BrandColors.WHITE} />
                )}
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By creating an account, I agree to the{" "}
                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    Alert.alert(
                      "Terms of Service",
                      "By using TaxEdge, you agree to statutory Indian tax filing and compliance guidelines, confidential credential management, and authorized tax representation."
                    )
                  }
                >
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    Alert.alert(
                      "Privacy Policy",
                      "TaxEdge uses bank-grade 256-bit encryption to safeguard your PAN, Aadhaar, and financial records. We do not sell your data to third parties."
                    )
                  }
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
            {profileErrors.terms ? (
              <Text style={[styles.errorText, { marginBottom: 8, paddingHorizontal: 2 }]}>
                {profileErrors.terms}
              </Text>
            ) : null}

            {/* Create Account / Final Registration Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleFinalRegistration}
              disabled={profileLoading}
              style={[
                styles.submitBtnOrange,
                profileLoading && styles.submitBtnDisabled,
              ]}
            >
              {profileLoading ? (
                <ActivityIndicator color={BrandColors.WHITE} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Button for Step 1: Continue to Registration */}
      {currentStep === 1 && (
        <View
          style={[
            styles.fixedBottomBar,
            { position: "relative" },
            {
              paddingBottom: Math.max(insets.bottom + Spacing.sm, Spacing.base),
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleProceedToRegistration}
            disabled={!form.customerType}
            style={styles.submitBtnOrange}
          >
            <Text style={styles.submitBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Calendar Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.calendarModalContent,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.calendarHeader}>
              <Text style={[styles.calendarTitle, { color: BrandColors.PRIMARY_BLUE }]}>
                Select Date of Birth
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Month & Year Bar */}
            <View style={styles.monthYearNav}>
              <TouchableOpacity
                onPress={() => {
                  if (pickerMonth === 0) {
                    setPickerMonth(11);
                    setPickerYear((y) => y - 1);
                  } else {
                    setPickerMonth((m) => m - 1);
                  }
                }}
                style={styles.navArrow}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={BrandColors.PRIMARY_BLUE}
                />
              </TouchableOpacity>

              <View style={styles.monthYearDisplay}>
                <Text
                  style={[
                    styles.monthYearText,
                    { color: BrandColors.PRIMARY_BLUE },
                  ]}
                >
                  {months[pickerMonth]} {pickerYear}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (pickerMonth === 11) {
                    setPickerMonth(0);
                    setPickerYear((y) => y + 1);
                  } else {
                    setPickerMonth((m) => m + 1);
                  }
                }}
                style={styles.navArrow}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={BrandColors.PRIMARY_BLUE}
                />
              </TouchableOpacity>
            </View>

            {/* Fast Year Switcher Chips */}
            <View style={styles.yearQuickRow}>
              {[-10, -5, +5, +10].map((offset) => (
                <TouchableOpacity
                  key={offset}
                  onPress={() => setPickerYear((y) => y + offset)}
                  style={styles.yearChip}
                >
                  <Text style={styles.yearChipText}>
                    {offset > 0 ? `+${offset}` : offset} Yrs
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Weekday headers */}
            <View style={styles.weekdaysRow}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <Text key={d} style={styles.weekdayText}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {Array.from({
                length: new Date(pickerYear, pickerMonth, 1).getDay(),
              }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCellEmpty} />
              ))}

              {Array.from({
                length: new Date(pickerYear, pickerMonth + 1, 0).getDate(),
              }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = pickerDay === dayNum;
                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    onPress={() => setPickerDay(dayNum)}
                    style={[
                      styles.dayCell,
                      isSelected && {
                        backgroundColor: BrandColors.PRIMARY_BLUE,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        {
                          color: isSelected ? BrandColors.WHITE : colors.text,
                        },
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={[styles.modalCancelBtn, { borderColor: "#BFDBFE" }]}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmCalendarDate}
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: BrandColors.PRIMARY_ORANGE },
                ]}
              >
                <Text style={styles.modalConfirmText}>Apply Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.genderModalContent}>
            <View style={styles.calendarHeader}>
              <Text
                style={[
                  styles.calendarTitle,
                  { color: BrandColors.PRIMARY_BLUE_DARK },
                ]}
              >
                Select Gender
              </Text>
              <TouchableOpacity
                onPress={() => setShowGenderModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {GENDER_OPTIONS.map((g) => {
              const isSelected = form.gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  activeOpacity={0.7}
                  onPress={() => {
                    updateForm("gender", g);
                    setShowGenderModal(false);
                    setTimeout(() => dobRef.current?.focus(), 150);
                  }}
                  style={[
                    styles.genderOption,
                    isSelected && styles.genderOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      isSelected && styles.genderOptionTextSelected,
                    ]}
                  >
                    {g}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={BrandColors.PRIMARY_ORANGE}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* State / UT Selection Modal */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.stateModalContent}>
            <View style={styles.calendarHeader}>
              <Text
                style={[
                  styles.calendarTitle,
                  { color: BrandColors.PRIMARY_BLUE_DARK },
                ]}
              >
                Select State / UT
              </Text>
              <TouchableOpacity
                onPress={() => setShowStateModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search Box */}
            <View style={styles.stateSearchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color={BrandColors.TEXT_MUTED}
              />
              <TextInput
                style={styles.stateSearchInput}
                value={stateSearchQuery}
                onChangeText={setStateSearchQuery}
                placeholder="Search State / UT"
                placeholderTextColor={BrandColors.TEXT_MUTED}
              />
              {stateSearchQuery ? (
                <TouchableOpacity onPress={() => setStateSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* State List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredStates.map((s) => {
                const isSelected = form.state === s;
                return (
                  <TouchableOpacity
                    key={s}
                    activeOpacity={0.7}
                    onPress={() => {
                      updateForm("state", s);
                      setShowStateModal(false);
                      setTimeout(() => passcodeRef.current?.focus(), 150);
                    }}
                    style={[
                      styles.stateItem,
                      isSelected && styles.stateItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stateItemText,
                        isSelected && styles.stateItemTextSelected,
                      ]}
                    >
                      {s}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={BrandColors.PRIMARY_ORANGE}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Biometric Enable Prompt Modal */}
      <BiometricPromptModal
        visible={showBiometricModal}
        biometricType={biometricType}
        onEnable={handleEnableBiometric}
        onNotNow={handleNotNowBiometric}
      />
    </KeyboardAvoidingView>
  );
}

interface FieldProps
  extends Omit<
    TextInputProps,
    "value" | "onChangeText" | "placeholder" | "style" | "onBlur" | "onFocus"
  > {
  label?: string;
  labelRightElement?: React.ReactNode;
  leftIcon?: IconName;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  error?: string;
  containerOnLayout?: (event: any) => void;
}

const Field = React.forwardRef<TextInput, FieldProps>(function Field(
  {
    label,
    labelRightElement,
    leftIcon,
    value,
    onChangeText,
    onBlur,
    onFocus,
    placeholder,
    rightIcon,
    onRightIconPress,
    error,
    keyboardType,
    maxLength,
    returnKeyType,
    onSubmitEditing,
    containerOnLayout,
    ...props
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldContainer} onLayout={containerOnLayout}>
      {label ? (
        labelRightElement ? (
          <View style={styles.labelWithActionRow}>
            <Text style={styles.label}>{label}</Text>
            {labelRightElement}
          </View>
        ) : (
          <Text style={styles.label}>{label}</Text>
        )
      ) : null}
      <View
        style={[
          styles.inputBox,
          error
            ? {
                borderColor: Colors.error,
                backgroundColor: "#FEF2F2",
              }
            : {
                borderColor: isFocused
                  ? BrandColors.PRIMARY_ORANGE
                  : BrandColors.BORDER,
                backgroundColor: BrandColors.WHITE,
              },
          {
            borderWidth: isFocused || error ? BorderWidth.regular : BorderWidth.thin,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? Colors.error : BrandColors.PRIMARY_ORANGE}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setIsFocused(true);
            if (onFocus) onFocus();
          }}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
          placeholder={placeholder}
          placeholderTextColor={BrandColors.TEXT_MUTED}
          keyboardType={keyboardType}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          {...props}
        />
        {rightIcon &&
          (onRightIconPress ? (
            <TouchableOpacity
              onPress={onRightIconPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.rightIconTouch}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={BrandColors.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          ) : (
            <Ionicons
              name={rightIcon}
              size={18}
              color={BrandColors.TEXT_SECONDARY}
              style={styles.rightIcon}
            />
          ))}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});
