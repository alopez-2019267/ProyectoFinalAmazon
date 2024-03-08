import { initServer } from "./configs/app.js"
import { connect } from "./configs/mong.js"
import { userDef } from "./src/user/user.controller.js"
import { categoryDef } from "./src/category/category.controller.js"

initServer()
connect()
userDef()
categoryDef()