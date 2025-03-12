import { combineReducers } from "redux";
import productReducer from "./productReducer";
import categoryReducer from "./CategoryModuls";
import memberReducer from "./MemberModule";
import favoriteReducer from "./FavoriteModule";
import chatReducer from "./ChatModule";
import ownerReducer from "./OwnerModule";

export default combineReducers({
    product: productReducer,
    category: categoryReducer,
    member: memberReducer,
    favorite: favoriteReducer,
    chat: chatReducer,
    owner: ownerReducer,
})
