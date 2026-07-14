

export const designUser = {
  id: "u0",
  name: "Dylan Field",
  avatar: "/assets/images/profile.png",
};

export const notifications = [
  {
    id: "n1",
    image: "/assets/images/friend-req.png",
    type: "friendPost",
    name: "Steve Jobs",
    time: "42 miniutes ago",
  },
  {
    id: "n2",
    image: "/assets/images/profile-1.png",
    type: "groupRename",
    oldName: "Freelacer usa",
    newName: "Freelacer usa",
    time: "42 miniutes ago",
  },
];
// Repeat the two notifications to match the original template's long list
export const notificationList = Array.from({ length: 9 }, (_, i) => ({
  ...notifications[i % 2],
  id: `n${i + 1}`,
}));

export const desktopStories = [
  { id: "s1", name: "Your Story", image: "/assets/images/card_ppl1.png", isSelf: true },
  { id: "s2", name: "Ryan Roslansky", image: "/assets/images/card_ppl2.png", mini: "/assets/images/mini_pic.png" },
  { id: "s3", name: "Ryan Roslansky", image: "/assets/images/card_ppl3.png", mini: "/assets/images/mini_pic.png" },
  { id: "s4", name: "Ryan Roslansky", image: "/assets/images/card_ppl4.png", mini: "/assets/images/mini_pic.png" },
];

export const mobileStories = [
  { id: "ms1", name: "Your Story", image: "/assets/images/mobile_story_img.png", state: "self" },
  { id: "ms2", name: "Ryan...", image: "/assets/images/mobile_story_img1.png", state: "active" },
  { id: "ms3", name: "Ryan...", image: "/assets/images/mobile_story_img2.png", state: "inactive" },
  { id: "ms4", name: "Ryan...", image: "/assets/images/mobile_story_img1.png", state: "active" },
  { id: "ms5", name: "Ryan...", image: "/assets/images/mobile_story_img2.png", state: "inactive" },
  { id: "ms6", name: "Ryan...", image: "/assets/images/mobile_story_img1.png", state: "active" },
  { id: "ms7", name: "Ryan...", image: "/assets/images/mobile_story_img.png", state: "self" },
  { id: "ms8", name: "Ryan...", image: "/assets/images/mobile_story_img1.png", state: "active" },
];

export const explore = [
  { id: "e1", label: "Learning", href: "#0", badge: "New" },
  { id: "e2", label: "Insights", href: "#0" },
  { id: "e3", label: "Find friends", href: "find-friends.html" },
  { id: "e4", label: "Bookmarks", href: "#0" },
  { id: "e5", label: "Group", href: "group.html" },
  { id: "e6", label: "Gaming", href: "#0", badge: "New" },
  { id: "e7", label: "Settings", href: "#0" },
  { id: "e8", label: "Save post", href: "#0" },
];

export const suggestedPeople = [
  { id: "p1", name: "Steve Jobs", title: "CEO of Apple", image: "/assets/images/people1.png" },
  { id: "p2", name: "Ryan Roslansky", title: "CEO of Linkedin", image: "/assets/images/people2.png" },
  { id: "p3", name: "Dylan Field", title: "CEO of Figma", image: "/assets/images/people3.png" },
];

export const events = [
  {
    id: "ev1",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
    day: "10",
    month: "Jul",
    going: 17,
  },
  {
    id: "ev2",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
    day: "10",
    month: "Jul",
    going: 17,
  },
];

export const youMightLike = {
  id: "yml1",
  name: "Radovan SkillArena",
  title: "Founder & CEO at Trophy",
  image: "/assets/images/Avatar.png",
};

export const friends = [
  { id: "f1", name: "Steve Jobs", title: "CEO of Apple", image: "/assets/images/people1.png", status: "time", time: "5 minute ago" },
  { id: "f2", name: "Ryan Roslansky", title: "CEO of Linkedin", image: "/assets/images/people2.png", status: "online" },
  { id: "f3", name: "Dylan Field", title: "CEO of Figma", image: "/assets/images/people3.png", status: "online" },
  { id: "f4", name: "Steve Jobs", title: "CEO of Apple", image: "/assets/images/people1.png", status: "time", time: "5 minute ago" },
  { id: "f5", name: "Ryan Roslansky", title: "CEO of Linkedin", image: "/assets/images/people2.png", status: "online" },
  { id: "f6", name: "Dylan Field", title: "CEO of Figma", image: "/assets/images/people3.png", status: "online" },
  { id: "f7", name: "Dylan Field", title: "CEO of Figma", image: "/assets/images/people3.png", status: "online" },
  { id: "f8", name: "Steve Jobs", title: "CEO of Apple", image: "/assets/images/people1.png", status: "time", time: "5 minute ago" },
];

export const profileDropdownLinks = [
  { id: "pd1", label: "Settings", href: "#0" },
  { id: "pd2", label: "Help & Support", href: "#0" },
  { id: "pd3", label: "Log Out", href: "#0" },
];

export const postDropdownLinks = [
  { id: "td1", label: "Save Post" },
  { id: "td2", label: "Turn On Notification" },
  { id: "td3", label: "Hide" },
  { id: "td4", label: "Edit Post" },
  { id: "td5", label: "Delete Post" },
];
