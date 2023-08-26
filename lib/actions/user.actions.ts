"use server";

import { revalidatePath } from "@/node_modules/next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  name,
  bio,
  image,
  path,
  username,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true }
    );
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message} `);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId });
    //.populate({
    // path: "communities",
    //model: "community",
    //});
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string){

  try {
connectToDB();
//Find all threads authored byuser with the given user Id 
//TODO Populate Community

const threads = await User.findOne({ id: userId })
.populate({
  path:'threads',
  model: Thread,
  populate: {
    path: 'children',
    model: Thread,
    populate: {
      path: 'author',
      model: User,
      select: 'name image id'
    }
  }
})
return threads;

  } catch (error: any){
throw new Error(`Failed to fetch user posts: ${error.message}`)
  }
}
