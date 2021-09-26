import {createAsyncThunk} from '@reduxjs/toolkit';
import {postService} from 'services/post.service';
import {userService} from 'services/user.service';
import {Profile} from 'model/profile.model';
import {Post} from 'model/post.model';

const prefix = "bookDetails/"

export const BOOK_DETAILS_ACTIONS = {
    fetchBook: prefix + "fetchBook",
    fetchUser: prefix + "fetchUser",
    savePost: prefix + "savePost"
}

const savePost = createAsyncThunk<void, { postId: string, save: boolean }>(BOOK_DETAILS_ACTIONS.savePost,async arg => {
    await postService.savePost()
})

const fetchUser = createAsyncThunk<Profile, { uid?: string }>(BOOK_DETAILS_ACTIONS.fetchUser, async arg => {
    return userService.fetchUser()
})


const fetchPost = createAsyncThunk<Post, { uid: string }>(BOOK_DETAILS_ACTIONS.savePost, async (arg) => {
    return postService.fetchPost()
})

export const BookDetailActions = {
    fetchPost,
    fetchUser,
    savePost
}