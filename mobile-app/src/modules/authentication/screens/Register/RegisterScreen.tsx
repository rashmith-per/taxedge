import React, { useState, useEffect } from "react";
import {
  View, Text, KeyboardAvoidingView, Platform, ScrollView,
  TouchableOpacity, BackHandler, StyleSheet, LayoutAnimation,
  Keyboard, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";
import { BrandColors, Colors, Spacing } from "@/shared/theme";
import { BiometricPromptModal } from "@/shared/components/BiometricPromptModal";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import { styles } from "./RegisterScreen.styles";
import { useCreateProfile } from "@/components/screens/create-profile/useCreateProfile";
import { FormField, GenderPickerModal, StatePickerModal } from "@/components/screens/create-profile/CreateProfileModals";
import { CUSTOMER_TYPE_OPTIONS } from "@/components/screens/create-profile/types";

export function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const {
    form, updateForm, handlePanChange, handleDobChange, handleBlur,
    profileErrors, profileLoading, handleProceedToRegistration, handleFinalRegistration,
    handleBack, panKeyboardType, showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword, agreedToTerms, setAgreedToTerms,
    showAddressLine2, setShowAddressLine2, keyboardHeight, setFieldOffset,
    handleFieldFocus, scrollRef, nameRef, emailRef, fatherSpouseRef,
    panRef, aadhaarRef, address1Ref, address2Ref, cityRef, pinRef,
    passcodeRef, confirmPasscodeRef,
    showGenderModal, setShowGenderModal, showStateModal, setShowStateModal,
    stateSearchQuery, setStateSearchQuery, showBiometricModal, biometricType,
    handleEnableBiometric, handleNotNowBiometric,
  } = useCreateProfile(currentStep, setCurrentStep);

  useEffect(() => {
    const onBack = () => {
      if (currentStep === 2) {
        setCurrentStep(1);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, [currentStep, scrollRef]);

  const yo = (key: string) => ({ onLayout: (e: any) => setFieldOffset(key, e.nativeEvent.layout.y) });
  const ff = (key: string) => ({ onFocus: () => handleFieldFocus(key), onBlur: () => handleBlur(key as any) });

  const scrollBottomPadding = currentStep === 1 ? Spacing.base
    : keyboardHeight > 0 ? keyboardHeight + (Platform.OS === "android" ? 100 : 60)
    : Math.max(insets.bottom + Spacing.xl, 40);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      style={[styles.container, { backgroundColor: BrandColors.BACKGROUND }]}
    >
      <View style={styles.waveHeaderWrapper}>
        <Svg height={150} width="100%" viewBox="0 0 375 150" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
          <Path d="M0,0 L375,0 L375,100 C310,140 230,135 140,115 C60,95 20,110 0,120 Z" fill={BrandColors.PRIMARY_BLUE_DARK} />
          <Path d="M260,0 C295,35 335,55 375,58 L375,0 Z" fill={BrandColors.PRIMARY_ORANGE} />
        </Svg>
        <View style={[styles.waveHeaderContent, { paddingTop: Math.max(insets.top + Spacing.sm, Spacing.xl) }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backBtnWhite} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="arrow-back" size={24} color={BrandColors.WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitleWhite}>{currentStep === 1 ? "Select Account Type" : "Create Account"}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={currentStep === 1 ? { flex: 1 } : undefined}
        contentContainerStyle={[styles.profileScroll, { paddingBottom: scrollBottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {currentStep === 1 ? (
          <>
            <View style={styles.customerTypeContainer}>
              {CUSTOMER_TYPE_OPTIONS.map((opt) => {
                const sel = form.customerType === opt.key;
                return (
                  <TouchableOpacity key={opt.key} activeOpacity={0.8} onPress={() => updateForm("customerType", opt.key)}
                    style={[styles.customerTypeCard, sel && styles.customerTypeCardSelected]}>
                    <View style={[styles.cardIconContainer, sel && styles.cardIconContainerSelected]}>
                      <Ionicons name={opt.icon} size={22} color={sel ? BrandColors.PRIMARY_ORANGE : BrandColors.PRIMARY_BLUE} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, sel && styles.cardTitleSelected]}>{opt.title}</Text>
                      <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
                    </View>
                    <View style={[styles.radioCircle, sel && styles.radioCircleSelected]}>
                      {sel && <Ionicons name="checkmark" size={14} color={BrandColors.WHITE} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.fixedBottomBar, { position: "relative", paddingBottom: Math.max(insets.bottom + Spacing.sm, Spacing.base) }]}>
              <TouchableOpacity activeOpacity={0.85} onPress={handleProceedToRegistration} disabled={!form.customerType} style={styles.submitBtnOrange}>
                <Text style={styles.submitBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.formSection}>
            <TouchableOpacity activeOpacity={0.7}
              onPress={() => { setCurrentStep(1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
              style={styles.accountTypeBadge}>
              <View style={styles.accountTypeBadgeLeft}>
                <Ionicons name="briefcase-outline" size={20} color={BrandColors.PRIMARY_BLUE} />
                <View>
                  <Text style={styles.accountTypeBadgeLabel}>Account Type</Text>
                  <Text style={styles.accountTypeBadgeValue}>{form.customerType || "Individual"}</Text>
                </View>
              </View>
              <View style={styles.accountTypeBadgeRight}>
                <Text style={styles.accountTypeBadgeChangeText}>Change</Text>
                <Ionicons name="chevron-forward" size={14} color={BrandColors.PRIMARY_ORANGE} />
              </View>
            </TouchableOpacity>

            <FormField fieldRef={nameRef} {...yo("name")} label="Full Name" leftIcon="person-outline"
              value={form.name} onChange={(t) => updateForm("name", t)} {...ff("name")}
              placeholder="Full Name" error={profileErrors.name} returnKeyType="next" onSubmit={() => emailRef.current?.focus()} />

            <FormField fieldRef={emailRef} {...yo("email")} label="Email" leftIcon="mail-outline"
              value={form.email} onChange={(t) => updateForm("email", t)} {...ff("email")}
              placeholder="Email" keyboardType="email-address" autoCapitalize="none"
              error={profileErrors.email} returnKeyType="next"
              onSubmit={() => { Keyboard.dismiss(); setShowGenderModal(true); }} />

            <View style={styles.fieldContainer} {...yo("gender")}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => { Keyboard.dismiss(); setShowGenderModal(true); }}
                style={[styles.inputBox, profileErrors.gender ? styles.inputBoxError : styles.inputBoxDefault]}>
                <Ionicons name="transgender-outline" size={20} color={profileErrors.gender ? Colors.error : BrandColors.PRIMARY_ORANGE} style={styles.leftIcon} />
                <Text style={[styles.dropdownText, !form.gender && { color: BrandColors.TEXT_MUTED }]}>{form.gender || "Gender"}</Text>
                <Ionicons name="chevron-down" size={20} color={BrandColors.TEXT_SECONDARY} style={styles.rightIcon} />
              </TouchableOpacity>
              {profileErrors.gender ? <Text style={styles.errorText}>{profileErrors.gender}</Text> : null}
            </View>

            <View {...yo("dob")}>
              <UniversalDatePicker
                label="Date of Birth"
                value={form.dob}
                onChange={(d) => {
                  handleDobChange(d);
                  setTimeout(() => fatherSpouseRef.current?.focus(), 150);
                }}
                error={profileErrors.dob}
                valueFormat="DD-MM-YYYY"
                placeholder="DD-MM-YYYY"
                maximumDate={new Date()}
                initialPickerDate={new Date(2000, 0, 1)}
                iconColor={BrandColors.PRIMARY_ORANGE}
              />
            </View>

            <FormField fieldRef={fatherSpouseRef} {...yo("fatherSpouseName")} label="Father's / Spouse Name" leftIcon="people-outline"
              value={form.fatherSpouseName} onChange={(t) => updateForm("fatherSpouseName", t)} {...ff("fatherSpouseName")}
              placeholder="Father's / Spouse Name" error={profileErrors.fatherSpouseName}
              returnKeyType="next" onSubmit={() => panRef.current?.focus()} />

            <FormField fieldRef={panRef} {...yo("pan")} label="PAN Number" leftIcon="card-outline"
              value={form.pan} onChange={handlePanChange} {...ff("pan")}
              placeholder="PAN Number" autoCapitalize="characters" keyboardType={panKeyboardType} maxLength={10}
              error={profileErrors.pan} returnKeyType="next" onSubmit={() => aadhaarRef.current?.focus()} />

            <FormField fieldRef={aadhaarRef} {...yo("aadhaar")} label="Aadhaar Number" leftIcon="newspaper-outline"
              value={form.aadhaar} onChange={(t) => updateForm("aadhaar", t.replace(/\D/g, "").slice(0, 12))} {...ff("aadhaar")}
              placeholder="Aadhaar Number" keyboardType="number-pad" maxLength={12}
              error={profileErrors.aadhaar} returnKeyType="next" onSubmit={() => address1Ref.current?.focus()} />

            <FormField fieldRef={address1Ref} {...yo("addressLine1")} label="Address Line 1 *"
              labelRight={!showAddressLine2 ? (
                <TouchableOpacity activeOpacity={0.7} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowAddressLine2(true); setTimeout(() => address2Ref.current?.focus(), 150); }}
                  style={styles.addAddressLineBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="add" size={16} color={BrandColors.PRIMARY_ORANGE} />
                  <Text style={styles.addAddressLineBtnText}>Add Line 2</Text>
                </TouchableOpacity>
              ) : null}
              leftIcon="home-outline" value={form.addressLine1} onChange={(t) => updateForm("addressLine1", t)} {...ff("addressLine1")}
              placeholder="House / Building / Street" error={profileErrors.addressLine1} returnKeyType="next"
              onSubmit={() => showAddressLine2 ? address2Ref.current?.focus() : cityRef.current?.focus()} />

            {showAddressLine2 && (
              <FormField fieldRef={address2Ref} label="Address Line 2 (Optional)" leftIcon="location-outline"
                value={form.addressLine2} onChange={(t) => updateForm("addressLine2", t)} onFocus={() => handleFieldFocus("addressLine2")}
                placeholder="Locality, Landmark" returnKeyType="next" onSubmit={() => cityRef.current?.focus()} />
            )}

            <View style={styles.cityPinRow} onLayout={(e) => { setFieldOffset("city", e.nativeEvent.layout.y); setFieldOffset("pincode", e.nativeEvent.layout.y); }}>
              <View style={styles.cityCol}>
                <FormField fieldRef={cityRef} label="City" leftIcon="business-outline"
                  value={form.city} onChange={(t) => updateForm("city", t)} {...ff("city")}
                  placeholder="City" error={profileErrors.city} returnKeyType="next" onSubmit={() => pinRef.current?.focus()} />
              </View>
              <View style={styles.pinCol}>
                <FormField fieldRef={pinRef} label="PIN Code" leftIcon="pin-outline"
                  value={form.pincode} onChange={(t) => updateForm("pincode", t.replace(/\D/g, "").slice(0, 6))} {...ff("pincode")}
                  placeholder="PIN Code" keyboardType="number-pad" maxLength={6}
                  error={profileErrors.pincode} returnKeyType="next"
                  onSubmit={() => { Keyboard.dismiss(); setStateSearchQuery(""); setShowStateModal(true); }} />
              </View>
            </View>

            <View style={styles.fieldContainer} onLayout={(e) => setFieldOffset("state", e.nativeEvent.layout.y)}>
              <Text style={styles.label}>State / UT</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => { Keyboard.dismiss(); setStateSearchQuery(""); setShowStateModal(true); }}
                style={[styles.inputBox, profileErrors.state ? styles.inputBoxError : styles.inputBoxDefault]}>
                <Ionicons name="map-outline" size={20} color={profileErrors.state ? Colors.error : BrandColors.PRIMARY_ORANGE} style={styles.leftIcon} />
                <Text style={[styles.dropdownText, !form.state && { color: BrandColors.TEXT_MUTED }]}>{form.state || "State / UT"}</Text>
                <Ionicons name="chevron-down" size={20} color={BrandColors.TEXT_SECONDARY} style={styles.rightIcon} />
              </TouchableOpacity>
              {profileErrors.state ? <Text style={styles.errorText}>{profileErrors.state}</Text> : null}
            </View>

            <FormField fieldRef={passcodeRef} {...yo("password")} label="Passcode" leftIcon="lock-closed-outline"
              value={form.password} onChange={(t) => updateForm("password", t.replace(/\D/g, "").slice(0, 6))} {...ff("password")}
              placeholder="Passcode" keyboardType="number-pad" maxLength={6} secure={!showPassword}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"} onRightIcon={() => setShowPassword((p) => !p)}
              error={profileErrors.password} returnKeyType="next" onSubmit={() => confirmPasscodeRef.current?.focus()} />

            <FormField fieldRef={confirmPasscodeRef} {...yo("confirmPassword")} label="Confirm Passcode" leftIcon="lock-closed-outline"
              value={form.confirmPassword} onChange={(t) => updateForm("confirmPassword", t.replace(/\D/g, "").slice(0, 6))} {...ff("confirmPassword")}
              placeholder="Confirm Passcode" keyboardType="number-pad" maxLength={6} secure={!showConfirmPassword}
              rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"} onRightIcon={() => setShowConfirmPassword((p) => !p)}
              error={profileErrors.confirmPassword} returnKeyType="done" onSubmit={() => Keyboard.dismiss()} />

            <View style={styles.termsRow} onLayout={(e) => setFieldOffset("terms", e.nativeEvent.layout.y)}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setAgreedToTerms((p) => !p)}
                style={[styles.checkbox, agreedToTerms && styles.checkboxChecked, profileErrors.terms ? { borderColor: Colors.error, borderWidth: 2 } : null]}>
                {agreedToTerms && <Ionicons name="checkmark" size={16} color={BrandColors.WHITE} />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                By creating an account, I agree to the{" "}
                <Text style={styles.termsLink} onPress={() => Alert.alert("Terms of Service", "By using TaxEdge, you agree to statutory Indian tax filing and compliance guidelines, confidential credential management, and authorized tax representation.")}>
                  Terms of Service
                </Text>{" "}and{" "}
                <Text style={styles.termsLink} onPress={() => Alert.alert("Privacy Policy", "TaxEdge uses bank-grade 256-bit encryption to safeguard your PAN, Aadhaar, and financial records. We do not sell your data to third parties.")}>
                  Privacy Policy
                </Text>.
              </Text>
            </View>
            {profileErrors.terms && <Text style={[styles.errorText, styles.termsErrorText]}>{profileErrors.terms}</Text>}

            <TouchableOpacity activeOpacity={0.85} onPress={handleFinalRegistration} disabled={profileLoading}
              style={[styles.submitBtnOrange, profileLoading && styles.submitBtnDisabled]}>
              {profileLoading ? <ActivityIndicator color={BrandColors.WHITE} size="small" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <GenderPickerModal visible={showGenderModal} selectedGender={form.gender}
        onSelect={(g) => { updateForm("gender", g); setShowGenderModal(false); }}
        onClose={() => setShowGenderModal(false)} />

      <StatePickerModal visible={showStateModal} selectedState={form.state}
        searchQuery={stateSearchQuery} onSearchChange={setStateSearchQuery}
        onSelect={(s) => { updateForm("state", s); setShowStateModal(false); setTimeout(() => passcodeRef.current?.focus(), 150); }}
        onClose={() => setShowStateModal(false)} />

      <BiometricPromptModal visible={showBiometricModal} biometricType={biometricType}
        onEnable={handleEnableBiometric} onNotNow={handleNotNowBiometric} />
    </KeyboardAvoidingView>
  );
}

export default RegisterScreen;
