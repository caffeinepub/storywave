import List "mo:core/List";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type UserProfile = {
    username : Text;
    bio : Text;
    profilePictureUrl : Text;
  };

  type Category = {
    #horror;
    #romance;
    #motivation;
    #comedy;
    #scifi;
    #realLife;
  };

  type StoryMetadata = {
    id : Text;
    title : Text;
    description : Text;
    creator : Principal;
    creatorName : Text;
    category : Category;
    coverImageUrl : Text;
    audioFilePath : Text;
    published : Bool;
    likeCount : Nat;
    viewCount : Nat;
    isSaved : Bool;
  };

  type AIGeneratedStory = {
    title : Text;
    description : Text;
    genre : Text;
    tone : Text;
    body : Text;
  };

  type StoryDraft = {
    id : Text;
    author : Principal;
    draft : AIGeneratedStory;
  };

  module StoryMetadata {
    public func compareByLikeCount(story1 : StoryMetadata, story2 : StoryMetadata) : { #less; #equal; #greater } {
      if (story1.likeCount < story2.likeCount) { #greater } else if (story1.likeCount > story2.likeCount) {
        #less;
      } else { #equal };
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let stories = Map.empty<Text, StoryMetadata>();
  let userLikes = Map.empty<Principal, List.List<Text>>();
  let savedStories = Map.empty<Principal, List.List<Text>>();
  let storyAudioBlobs = Map.empty<Text, Storage.ExternalBlob>();
  let storyDrafts = Map.empty<Principal, StoryDraft>();

  // ── Profile management ──────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Any authenticated user can view any profile (needed for showing creator names)
    // Guests cannot look up profiles
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (not isUserProfileValid(profile)) {
      Runtime.trap("Validation failed: profile fields exceed allowed lengths");
    };
    userProfiles.add(caller, profile);
  };

  // Kept for backward compatibility; delegates to saveCallerUserProfile logic
  public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (not isUserProfileValid(profile)) {
      Runtime.trap("Validation failed: profile fields exceed allowed lengths");
    };
    userProfiles.add(caller, profile);
  };

  func isUserProfileValid(profile : UserProfile) : Bool {
    profile.username.size() <= 20 and profile.bio.size() <= 200 and profile.profilePictureUrl.size() <= 200;
  };

  // ── Story management ────────────────────────────────────────────────────────

  /// Create or update a story. The caller must be the story's creator.
  public shared ({ caller }) func saveStory(story : StoryMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can publish stories");
    };
    // Ensure the creator field matches the caller so users cannot impersonate others
    if (story.creator != caller) {
      Runtime.trap("Unauthorized: creator field must match the caller");
    };
    // If the story already exists, only the original creator may update it
    switch (stories.get(story.id)) {
      case (?existing) {
        if (existing.creator != caller) {
          Runtime.trap("Unauthorized: Only the story creator can update this story");
        };
      };
      case (null) {};
    };
    stories.add(story.id, story);
  };

  /// Upload the audio blob for a story. Only the story creator may do this.
  public shared ({ caller }) func saveAudioBlob(storyId : Text, audioBlob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload audio");
    };
    switch (stories.get(storyId)) {
      case (null) {
        Runtime.trap("Story does not exist");
      };
      case (?story) {
        if (story.creator != caller) {
          Runtime.trap("Unauthorized: Only the story creator can upload audio for this story");
        };
      };
    };
    storyAudioBlobs.add(storyId, audioBlob);
  };

  /// Increment view count. Any caller (including guests) can trigger this.
  public shared ({ caller }) func incrementStoryViews(storyId : Text) : async () {
    switch (stories.get(storyId)) {
      case (null) {
        Runtime.trap("Story does not exist");
      };
      case (?story) {
        let updatedStory = {
          id = story.id;
          title = story.title;
          description = story.description;
          creator = story.creator;
          creatorName = story.creatorName;
          category = story.category;
          coverImageUrl = story.coverImageUrl;
          audioFilePath = story.audioFilePath;
          published = story.published;
          likeCount = story.likeCount;
          viewCount = story.viewCount + 1;
          isSaved = story.isSaved;
        };
        stories.add(storyId, updatedStory);
      };
    };
  };

  // ── Like / Save toggles ─────────────────────────────────────────────────────

  public shared ({ caller }) func likeStory(storyId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like stories");
    };
    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story does not exist") };
      case (?story) {
        let currentLikes = switch (userLikes.get(caller)) {
          case (null) { List.empty<Text>() };
          case (?l) { l };
        };
        // Only add if not already liked
        if (not currentLikes.contains(storyId)) {
          let newLikes = List.fromArray([storyId]);
          userLikes.add(caller, newLikes);
          let updatedStory = {
            id = story.id;
            title = story.title;
            description = story.description;
            creator = story.creator;
            creatorName = story.creatorName;
            category = story.category;
            coverImageUrl = story.coverImageUrl;
            audioFilePath = story.audioFilePath;
            published = story.published;
            likeCount = story.likeCount + 1;
            viewCount = story.viewCount;
            isSaved = story.isSaved;
          };
          stories.add(storyId, updatedStory);
        };
      };
    };
  };

  public shared ({ caller }) func unlikeStory(storyId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike stories");
    };
    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story does not exist") };
      case (?story) {
        let currentLikes = switch (userLikes.get(caller)) {
          case (null) { List.empty<Text>() };
          case (?l) { l };
        };
        if (currentLikes.contains(storyId)) {
          userLikes.add(caller, currentLikes.filter(func(id) { id != storyId }));
          let newLikeCount = if (story.likeCount > 0) { story.likeCount - 1 } else { 0 };
          let updatedStory = {
            id = story.id;
            title = story.title;
            description = story.description;
            creator = story.creator;
            creatorName = story.creatorName;
            category = story.category;
            coverImageUrl = story.coverImageUrl;
            audioFilePath = story.audioFilePath;
            published = story.published;
            likeCount = newLikeCount;
            viewCount = story.viewCount;
            isSaved = story.isSaved;
          };
          stories.add(storyId, updatedStory);
        };
      };
    };
  };

  public shared ({ caller }) func saveStoryToLibrary(storyId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save stories to their library");
    };
    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story does not exist") };
      case (?_) {
        let currentSaved = switch (savedStories.get(caller)) {
          case (null) { List.empty<Text>() };
          case (?s) { s };
        };
        if (not currentSaved.contains(storyId)) {
          let newSaved = List.fromArray([storyId]);
          savedStories.add(caller, newSaved);
        };
      };
    };
  };

  public shared ({ caller }) func unsaveStoryFromLibrary(storyId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove stories from their library");
    };
    let currentSaved = switch (savedStories.get(caller)) {
      case (null) { List.empty<Text>() };
      case (?s) { s };
    };
    savedStories.add(caller, currentSaved.filter(func(id) { id != storyId }));
  };

  // ── Read-only queries (public, no auth required) ────────────────────────────

  public query func getAllStories() : async [StoryMetadata] {
    stories.values().toArray();
  };

  public query func getTrendingStories(limit : ?Nat) : async [StoryMetadata] {
    let sorted = stories.values().toArray().sort(StoryMetadata.compareByLikeCount);
    switch (limit) {
      case (null) { sorted };
      case (?n) {
        if (n >= sorted.size()) { sorted } else {
          sorted.sliceToArray(0, n);
        };
      };
    };
  };

  public query func getStoriesByCategory(category : Category) : async [StoryMetadata] {
    stories.values().toArray().filter(func(story) { story.category == category });
  };

  public query func searchStories(searchTerm : Text) : async [StoryMetadata] {
    stories.values().toArray().filter(
      func(story) {
        story.title.contains(#text searchTerm) or story.creatorName.contains(#text searchTerm);
      }
    );
  };

  public query func getUserStories(user : Principal) : async [StoryMetadata] {
    stories.values().toArray().filter(func(story) { story.creator == user });
  };

  /// Only the owner or an admin may see their liked stories list.
  public query ({ caller }) func getUserLikedStories(user : Principal) : async [Text] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own liked stories");
    };
    switch (userLikes.get(user)) {
      case (null) { [] };
      case (?likes) { likes.toArray() };
    };
  };

  /// Only the owner or an admin may see their saved stories list.
  public query ({ caller }) func getUserSavedStories(user : Principal) : async [Text] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own saved stories");
    };
    switch (savedStories.get(user)) {
      case (null) { [] };
      case (?saves) { saves.toArray() };
    };
  };

  // ── AI Story Generator ──────────────────────────────────────────────────────

  public shared ({ caller }) func generateAIDraftStory(id : Text, genre : Text, tone : Text, prompt : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate AI stories");
    };
    let story : AIGeneratedStory = {
      title = "The Mystery of Grange Mansion";
      description = "A suspenseful tale of a weekend gone wrong—a group of friends uncovers an ancient evil while staying at a remote mansion.";
      genre;
      tone;
      body = "Chapter One—Arrival at Grange Mansion\nThe rain battered the windows, and lightning illuminated the winding road leading to Grange Mansion. Four friends huddled in the car, hearts pounding with anticipation and fear. The mansion's looming silhouette promised adventure, but none of them could have predicted what awaited inside.\n\nChapter Two—Strange Noises and Shadows\nDuring dinner, strange noises echoed through the halls, and the shadows flickered. As the clock struck midnight, they discovered a hidden room filled with ancient artifacts. The air grew thick with tension as they realized they were not alone. Dark shapes moved in the corners, and whispered voices sent chills down their spines.\n\nChapter Three—The Evil Within\nWith courage and bravery, the friends confronted the ancient evil that haunted Grange Mansion. They unearthed long-forgotten secrets and performed a ritual to banish the darkness. The storm cleared, and the mansion filled with light. As the sun rose the next day, they left the mansion forever changed, ready to face any challenge that life might bring.";
    };
    let draft : StoryDraft = {
      id;
      author = caller;
      draft = story;
    };
    storyDrafts.add(caller, draft);
  };

  /// Only the owner of the draft may retrieve it.
  public query ({ caller }) func getDraftStory() : async ?StoryDraft {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve their draft story");
    };
    storyDrafts.get(caller);
  };
};
