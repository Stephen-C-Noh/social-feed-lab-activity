import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";

import { getApiErrorMessage } from "@/src/services/api";
import { getFeed } from "@/src/services/classFeed";
import { useAuth } from "../../src/auth/AuthContext";
import { PostCard } from "../../src/components/PostCard";
import type { Post } from "../../src/types";

function parseAuthors(input: string): string[] | undefined {
  const cleaned = input
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return cleaned.length ? cleaned : undefined;
}

export default function FeedScreen() {
  const { token, user, signOut } = useAuth();

  const [authorsInput, setAuthorsInput] = useState("");
  const [authorsInputTimeout, setAuthorsInputTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const authors = parseAuthors(authorsInput);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthorsInput = (text: string) => {
    // TODO: handle author filter input with debouncing using authorsInputTimeout
    // This is for the optional filtering feature and should be skipped until
    // the basic functionality is complete

    // The idea is that when yuser types autho names, the app should wait
    // a short period of time before reloading the feed instead of making a request
    // on every keystroke. This is called debouncing and can be implemented using setTimeout and clearTimeout. You can use the handleAuthorsInput function to update the authorsInput state and also set a timeout to call loadFeed after a short delay (e.g. 500ms). If the user types again before the timeout is reached, you should clear the previous timeout and set a new one. This way, loadFeed will only be called after the user has stopped typing for 500ms, reducing the number of unnecessary requests to the server.
    setAuthorsInput(text);
    if (authorsInputTimeout) {
      clearTimeout(authorsInputTimeout);
    }
    const timeout = setTimeout(() => {
      loadFeed();
    }, 500);
    setAuthorsInputTimeout(timeout);
  };

  async function loadFeed() {
    // TODO: ensure token exists, get feed and set posts, and handle loading and errors
    if (!token) {
      setError("You must be logged in to view the feed.");
      setPosts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const feed = await getFeed(authors);
      setPosts(feed.posts);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
    // reload when filter changes
  }, [authorsInput]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Loading feed…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12, gap: 10 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>
          Logged in as: {user?.username}
        </Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => router.push("/(app)/create-post")}
            style={{
              backgroundColor: "#111",
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 10,
              flex: 1,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              + New Post
            </Text>
          </Pressable>

          <Pressable
            onPress={() => signOut()}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text>Logout</Text>
          </Pressable>
        </View>

        <View style={{ gap: 6 }}>
          <Text>Filter authors (comma-separated, optional)</Text>
          <TextInput
            value={authorsInput}
            onChangeText={handleAuthorsInput}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="e.g. alex,sam"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
          <Pressable
            onPress={() => loadFeed()}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text>Reload</Text>
          </Pressable>
        </View>

        {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => loadFeed()} />
        }
        renderItem={({ item }) => (
          <PostCard post={item} onAfterComment={() => loadFeed()} />
        )}
        ListEmptyComponent={<Text>No posts yet.</Text>}
      />
    </View>
  );
}
