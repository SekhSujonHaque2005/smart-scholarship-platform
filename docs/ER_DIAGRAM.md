# ScholarHub — Entity Relationship (ER) Diagram

This diagram illustrates the database architecture of the ScholarHub platform, built with PostgreSQL and Prisma.

```mermaid
erDiagram
    USER ||--o| STUDENT : "userId"
    USER ||--o| PROVIDER : "userId"
    USER ||--o{ NOTIFICATION : "userId"
    USER ||--o{ MESSAGE : "sender/receiver"
    
    STUDENT ||--o{ APPLICATION : "studentId"
    STUDENT ||--o{ DOCUMENT : "studentId"
    STUDENT ||--o{ REVIEW : "studentId"
    
    PROVIDER ||--o{ SCHOLARSHIP : "providerId"
    PROVIDER ||--o{ REVIEW : "providerId"
    PROVIDER ||--o{ TRANSACTION : "providerId"
    
    SCHOLARSHIP ||--o{ APPLICATION : "scholarshipId"
    SCHOLARSHIP ||--o{ TRANSACTION : "scholarshipId"
    
    APPLICATION ||--o{ DOCUMENT : "appId"
    APPLICATION ||--o| FRAUDFLAG : "applicationId"
    APPLICATION ||--o{ MESSAGE : "applicationId"
    APPLICATION ||--o{ TRANSACTION : "applicationId"

    USER {
        string id PK
        string email UK
        string password
        enum role
        boolean isActive
    }

    STUDENT {
        string id PK
        string userId FK
        string name
        float cgpa
        string fieldOfStudy
    }

    PROVIDER {
        string id PK
        string userId FK
        string orgName
        int trustScore
    }

    SCHOLARSHIP {
        string id PK
        string providerId FK
        string title
        float amount
        datetime deadline
    }

    APPLICATION {
        string id PK
        string studentId FK
        string scholarshipId FK
        enum status
        datetime submittedAt
    }

    DOCUMENT {
        string id PK
        string fileUrl
        string docType
    }
```

## Core Relationships
1. **User - Roles**: A 1-to-1 relationship between `User` and `Student` or `Provider`.
2. **Scholarship - Applications**: A 1-to-many relationship where a single scholarship can have multiple student applications.
3. **Application - Integrity**: Linked to `Document` for verification and `FraudFlag` for AI-based security scoring.
4. **Communication**: `Messages` are tied to specific `Applications` to ensure context-aware chat between students and providers.
