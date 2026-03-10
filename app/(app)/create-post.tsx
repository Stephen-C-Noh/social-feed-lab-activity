import { router } from "expo-router";
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
import { createPost } from "@/src/services/classFeed";
import { useAuth } from "../../src/auth/AuthContext";

const Schema = Yup.object({
  text: Yup.string().trim().max(280, "max 280 chars").required("required"),
});

export default function CreatePostScreen() {
  const { token } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Formik
        initialValues={{ text: "" }}
        validationSchema={Schema}
        onSubmit={async (values, { setSubmitting }) => {
          // TODO: ensure the token exists, create the post using the values, redirect the user and handle errors and submitting
          if (!token) {
            setApiError("You must be logged in to create a post.");
            setSubmitting(false);
            return;
          }

          try {
            setApiError(null);
            await createPost(values.text);
            router.replace("/(app)/feed");
          } catch (err) {
            setApiError(getApiErrorMessage(err));
          } finally {
            setSubmitting(false);
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
              <Text>Post Text</Text>
              <TextInput
                value={values.text}
                onChangeText={handleChange("text")}
                onBlur={handleBlur("text")}
                placeholder="say something to the class…"
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  minHeight: 120,
                  textAlignVertical: "top",
                }}
              />
              {touched.text && errors.text ? (
                <Text style={{ color: "crimson" }}>{errors.text}</Text>
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
                <Text style={{ color: "white", fontWeight: "600" }}>Post</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text>Cancel</Text>
            </Pressable>
          </View>
        )}
      </Formik>
    </View>
  );
}
