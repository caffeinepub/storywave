import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
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

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    stories : Map.Map<Text, StoryMetadata>;
    userLikes : Map.Map<Principal, List.List<Text>>;
    savedStories : Map.Map<Principal, List.List<Text>>;
    storyAudioBlobs : Map.Map<Text, Storage.ExternalBlob>;
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

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    stories : Map.Map<Text, StoryMetadata>;
    userLikes : Map.Map<Principal, List.List<Text>>;
    savedStories : Map.Map<Principal, List.List<Text>>;
    storyAudioBlobs : Map.Map<Text, Storage.ExternalBlob>;
    storyDrafts : Map.Map<Principal, StoryDraft>;
  };

  public func run(old : OldActor) : NewActor {
    { old with storyDrafts = Map.empty<Principal, StoryDraft>() };
  };
};
