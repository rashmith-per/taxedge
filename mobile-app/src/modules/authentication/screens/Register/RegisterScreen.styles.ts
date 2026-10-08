/**
 * Screen: Create Profile / Register Styles
 * Module-owned styles.
 * Preserves all styling keys with zero functional regression.
 */

import { StyleSheet } from "react-native";
import { formStyles } from "./RegisterScreen.form.styles";
import { modalStyles } from "./RegisterScreen.modal.styles";

export { formStyles, modalStyles };

export const styles = StyleSheet.create({
  ...formStyles,
  ...modalStyles,
});

export default styles;
