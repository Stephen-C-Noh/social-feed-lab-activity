import { Formik } from "formik";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Yup from "yup";

import { getApiErrorMessage } from "@/src/services/api";
import { login } from "@/src/services/classFeed";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";

const Schema = Yup.object({
  username: Yup.string()
    .trim()
    .lowercase()
    .matches(/^[a-z0-9_]+$/, "use only a-z, 0-9, underscore")
    .min(2, "too short")
    .max(20, "too long")
    .required("required"),
});

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "600", textAlign: "center" }}>
        Class Feed
      </Text>

      <Formik
        initialValues={{ username: "" }}
        validationSchema={Schema}
        onSubmit={async (values, helpers) => {
          // TODO: Call the api to log the user in (using the service function), sign in the user in the auth context,
          // and redirect the user to the feed (plus nice error handling and submitting logic)
          try {
            setApiError(null);
            const { token, user } = await login(values.username);

            await signIn(token, user);
            router.replace("/(app)/feed");
          } catch (err) {
            setApiError(getApiErrorMessage(err));
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          errors,
          touched,
        }) => (
          <View style={{ gap: 10 }}>
            <View style={{ gap: 6 }}>
              <Text>Username</Text>
              <TextInput
                value={values.username}
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="e.g. alex_1"
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              />
              {touched.username && errors.username ? (
                <Text style={{ color: "crimson" }}>{errors.username}</Text>
              ) : null}
            </View>

            {apiError ? (
              <Text style={{ color: "crimson" }}>{apiError}</Text>
            ) : null}

            <Pressable
              onPress={() => handleSubmit()}
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? "#999" : "#111",
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white", fontWeight: "600" }}>Login</Text>
              )}
            </Pressable>
          </View>
        )}
      </Formik>
    </View>
  );
}
