export type ProfileTemplate = "classic" | "postcard";

export type Classmate = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  industry: string;
  hometown: string;
  zodiac: string;
  constellation: string;
  hobbies: string[];
  direction3c: string;
  story: string;
  message: string;
  template: ProfileTemplate;
};
