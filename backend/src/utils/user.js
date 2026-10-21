export function safeUser(user) { return { id: user._id, fullName: user.fullName, username: user.username, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl, website: user.website }; }
