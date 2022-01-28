const bcrypt = require('bcrypt');
const userService = require('../user/user.service');
const logger = require('../../services/logger.service');

// (async ()=>{
//     await signup('bubu', '123', 'Bubu Bi')
//     await signup('mumu', '123', 'Mumu Maha')
// })()

async function login(email) {
	logger.debug(`auth.service - login with email: ${email}`);

	const user = await userService.getByEmail(email);
	if (!user) return Promise.reject('Invalid username or password');
	// TODO: un-comment for real login
	// const match = await bcrypt.compare(password, user.password)
	// if (!match) return Promise.reject('Invalid username or password')

	delete user.password;
	user._id = user._id.toString();
	return user;
}

async function signup(email, fullname, initials, imgUrl, password) {
	const saltRounds = 10;

	logger.debug(`auth.service - signup with email: ${email}, fullname: ${fullname}`);
	if (!email || !password || !fullname) return Promise.reject('email and password are required!');
	const newPassword = password.toString();
	const hash = await bcrypt.hash(newPassword, saltRounds);
	return userService.add({email, fullname, initials, imgUrl, newPassword: hash});
}

module.exports = {
	signup,
	login,
};
