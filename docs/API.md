# ScholarHub — API Documentation

This document provides a reference for the primary endpoints available in the ScholarHub Core API.

## 🔑 Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Create a new student/provider account |
| POST | `/api/auth/login` | Authenticate and receive JWT |
| GET | `/api/auth/me` | Retrieve the currently logged-in user profile |

## 🎓 Scholarships
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/scholarships` | List all scholarships (Supports caching) |
| GET | `/api/scholarships/:id` | Get details for a specific scholarship |
| POST | `/api/scholarships` | Create a new scholarship (Provider only) |

## 📝 Applications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/applications` | Submit a scholarship application |
| GET | `/api/applications/my` | List applications for the current student |
| PATCH | `/api/applications/:id` | Update status (Provider only) |

## 📊 Analytics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/stats` | Retrieve platform-wide metrics (Total awards, etc.) |

## 🛠️ Internal Services
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/scraper/trigger` | Manually trigger the scholarship discovery scraper |

---
**Base URL**: `http://localhost:5000` (Local) / `https://api.scholarhub.org` (Prod)
**Auth Header**: `Authorization: Bearer <JWT_TOKEN>`
