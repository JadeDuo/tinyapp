# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## How to Use
* Begin by registering your account on the /register page.
* Navigate to the new URL page at /urls/new and input the full URL you'd like to shorten.
** Application currently does not support URL validation.
* You will arrive on the splash page for your new shortened url! If you made a typo in your URL, you can edit it here.
* Share your ShortURL with the world! anyone who navigates to /u/ShortID will be redirected to the LongURL you provided.
* The MyURLs page shows you all the ShortURLs you've made, and their associated LongURL.
* You can remove an entry by pressing the delete button, but be careful, that will also cease the redirect functionality if you've shared the ShortURL
* If you need to make a change, you can return to the individual ShortID page by clicking the edit button



