import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface StoryMetadata {
    id: string;
    coverImageUrl: string;
    title: string;
    creator: Principal;
    isSaved: boolean;
    likeCount: bigint;
    published: boolean;
    description: string;
    audioFilePath: string;
    creatorName: string;
    viewCount: bigint;
    category: Category;
}
export interface AIGeneratedStory {
    title: string;
    body: string;
    tone: string;
    description: string;
    genre: string;
}
export interface StoryDraft {
    id: string;
    author: Principal;
    draft: AIGeneratedStory;
}
export interface UserProfile {
    bio: string;
    username: string;
    profilePictureUrl: string;
}
export enum Category {
    realLife = "realLife",
    scifi = "scifi",
    motivation = "motivation",
    comedy = "comedy",
    horror = "horror",
    romance = "romance"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    generateAIDraftStory(id: string, genre: string, tone: string, prompt: string): Promise<void>;
    getAllStories(): Promise<Array<StoryMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Only the owner of the draft may retrieve it.
     */
    getDraftStory(): Promise<StoryDraft | null>;
    getStoriesByCategory(category: Category): Promise<Array<StoryMetadata>>;
    getTrendingStories(limit: bigint | null): Promise<Array<StoryMetadata>>;
    /**
     * / Only the owner or an admin may see their liked stories list.
     */
    getUserLikedStories(user: Principal): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Only the owner or an admin may see their saved stories list.
     */
    getUserSavedStories(user: Principal): Promise<Array<string>>;
    getUserStories(user: Principal): Promise<Array<StoryMetadata>>;
    /**
     * / Increment view count. Any caller (including guests) can trigger this.
     */
    incrementStoryViews(storyId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    likeStory(storyId: string): Promise<void>;
    /**
     * / Upload the audio blob for a story. Only the story creator may do this.
     */
    saveAudioBlob(storyId: string, audioBlob: ExternalBlob): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Create or update a story. The caller must be the story's creator.
     */
    saveStory(story: StoryMetadata): Promise<void>;
    saveStoryToLibrary(storyId: string): Promise<void>;
    saveUserProfile(profile: UserProfile): Promise<void>;
    searchStories(searchTerm: string): Promise<Array<StoryMetadata>>;
    unlikeStory(storyId: string): Promise<void>;
    unsaveStoryFromLibrary(storyId: string): Promise<void>;
}
