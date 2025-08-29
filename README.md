# News Aggregator API

A RESTful API for personalized news aggregation built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Registration, login, and JWT-based authentication
- **Password Security**: Bcrypt password hashing
- **Data Validation**: Input validation middleware
- **MongoDB Integration**: Persistent data storage
- **News Aggregation**: External news API integration with caching
- **User Preferences**: Customizable news categories and interests
- **Article Management**: Mark articles as read/favorite
- **Search Functionality**: Search news articles by keywords
- **Caching System**: Intelligent caching to reduce API calls
- **Background Updates**: Periodic news refresh in the background

## Prerequisites

- Node.js (version 18 or higher)
- MongoDB (running locally or accessible via connection string)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd news-aggregator-api-ghanshyamca
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/news-aggregator
PORT=3000
NEWS_API_KEY=your-news-api-key-from-newsapi.org
SALT_ROUNDS=10
ENABLE_BACKGROUND_SERVICE=false
```

4. Start MongoDB (if running locally):
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# Or run MongoDB manually
mongod
```

5. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### POST /users/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### POST /users/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```



#### GET /users/preferences
Get user's news preferences (requires authentication).

#### PUT /users/preferences
Update user's news preferences (requires authentication).

**Request Body:**
```json
{
  "preferences": ["movies", "comics", "games"]
}
```



### News API

#### GET /news
Get personalized news based on user preferences (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "News fetched successfully",
  "userPreferences": ["movies", "comics"],
  "news": [
    {
      "category": "movies",
      "articles": [
        {
          "id": "article_id",
          "title": "Article Title",
          "description": "Article description",
          "url": "https://example.com/article",
          "urlToImage": "https://example.com/image.jpg",
          "publishedAt": "2024-01-01T00:00:00.000Z",
          "source": "News Source",
          "isRead": false,
          "isFavorite": false
        }
      ],
      "totalResults": 100
    }
  ],
  "totalCategories": 1,
  "failedCategories": 0,
  "fromCache": false
}
```

#### GET /news/search/:keyword
Search for news articles by keyword (requires authentication).

#### GET /news/read
Get all articles marked as read by the user (requires authentication).

#### GET /news/favorites
Get all articles marked as favorite by the user (requires authentication).

#### POST /news/:id/read
Mark an article as read (requires authentication).

#### POST /news/:id/favorite
Mark an article as favorite (requires authentication).

#### GET /news/cache/stats
Get cache statistics (requires authentication).

#### GET /news/background/status
Get background service status (requires authentication).

### Health Check

#### GET /health
Check server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Testing the API

### Using cURL

#### Register a new user:
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Get profile (with token):
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Using Postman

1. Import the collection or create new requests
2. Set the base URL to `http://localhost:3000`
3. For protected routes, add the Authorization header:
   - Type: Bearer Token
   - Token: Your JWT token from login/register

## Project Structure

```
news-aggregator-api-ghanshyamca/
├── app.js                           # Main application file
├── package.json                     # Dependencies and scripts
├── .env.example                    # Environment variables template
├── models/                         # Database models
│   ├── userModel.js                # User data model
│   └── userNewsInteractionModel.js # User-news interactions
├── controllers/                    # Route controllers
│   ├── userController.js           # User operations
│   └── newsController.js           # News operations
├── routes/                         # API routes
│   ├── userRoutes.js               # User endpoints
│   └── newsRoutes.js               # News endpoints
├── middlewares/                    # Custom middleware
│   ├── authMiddleware.js           # JWT authentication
│   └── validationMiddleware.js     # Input validation
├── services/                       # Business logic services
│   ├── cacheService.js             # News caching service
│   └── backgroundService.js        # Background news updates
└── test/                          # Test files
    └── server.test.js              # API tests
```

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **Environment Variables**: Sensitive data protection

## Running Tests

```bash
npm test
```

**Note**: Tests run in a separate test environment with mock data to avoid external API calls.

## Development

The application uses:
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB ODM
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication
- **dotenv**: Environment variable management
- **axios**: HTTP client for external API calls
- **node-cache**: In-memory caching system

## License

ISC
