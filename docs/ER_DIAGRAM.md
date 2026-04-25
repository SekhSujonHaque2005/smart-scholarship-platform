# 🗄️ Database ER Diagram — ScholarHub

> **Database**: PostgreSQL (Supabase) · **ORM**: Prisma 7 · **Models**: 14 · **Enums**: 6

---

## Complete Entity-Relationship Diagram

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String password
        Role role
        Boolean isActive
        String resetPasswordToken UK
        DateTime resetPasswordExpires
        DateTime createdAt
        Json preferences
        String profilePicture
        Boolean is2FAEnabled
        String twoFactorOTP
        DateTime twoFactorExpires
    }

    Student {
        String id PK
        String userId FK_UK
        String name
        Float cgpa
        String incomeLevel
        String fieldOfStudy
        String location
        String gender
        Boolean profileComplete
    }

    Provider {
        String id PK
        String userId FK_UK
        String orgName
        String orgType
        Int trustScore
        VerificationStatus verificationStatus
        DateTime approvedAt
    }

    Scholarship {
        String id PK
        String providerId FK
        String title
        String description
        Float amount
        DateTime deadline
        Json criteriaJson
        Json requirementsJson
        ScholarshipStatus status
        DateTime createdAt
        String sourceUrl
        Boolean isExternal
        String externalId UK
        String category
    }

    Application {
        String id PK
        String studentId FK
        String scholarshipId FK
        ApplicationStatus status
        Json formData
        DateTime submittedAt
        DateTime reviewedAt
        String remarks
    }

    Document {
        String id PK
        String studentId FK
        String providerId FK
        String appId FK
        String fileUrl
        String publicId
        String fileName
        Int fileSize
        String fileHash
        String docType
        DateTime uploadedAt
    }

    Review {
        String id PK
        String studentId FK
        String providerId FK
        Int rating
        String comment
        Boolean isModerated
        DateTime createdAt
    }

    Notification {
        String id PK
        String userId FK
        String type
        String title
        String message
        Boolean isRead
        DateTime createdAt
    }

    FraudFlag {
        String id PK
        String applicationId FK_UK
        Float fraudScore
        Json featuresJson
        String status
        DateTime flaggedAt
    }

    AuditLog {
        String id PK
        String entityType
        String entityId
        String action
        Json oldVal
        Json newVal
        String actorId FK
        DateTime timestamp
    }

    NewsletterSubscriber {
        String id PK
        String email UK
        Boolean isActive
        DateTime createdAt
    }

    Message {
        String id PK
        String applicationId FK
        String senderId FK
        String receiverId FK
        String content
        Boolean isRead
        DateTime createdAt
    }

    Transaction {
        String id PK
        String providerId FK
        Float amount
        TransactionType type
        TransactionStatus status
        String reference
        String scholarshipId FK
        String applicationId FK
        DateTime createdAt
    }

    User ||--o| Student : "has profile"
    User ||--o| Provider : "has profile"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "performs"
    User ||--o{ Message : "sends"
    User ||--o{ Message : "receives"

    Student ||--o{ Application : "submits"
    Student ||--o{ Document : "uploads"
    Student ||--o{ Review : "writes"

    Provider ||--o{ Scholarship : "creates"
    Provider ||--o{ Review : "receives"
    Provider ||--o{ Transaction : "manages"
    Provider ||--o{ Document : "uploads"

    Scholarship ||--o{ Application : "receives"
    Scholarship ||--o{ Transaction : "tracks"

    Application ||--o{ Document : "has"
    Application ||--o| FraudFlag : "flagged by"
    Application ||--o{ Message : "contains"
    Application ||--o{ Transaction : "triggers"
---

## Enums

```prisma
enum Role {
  STUDENT
  PROVIDER
  ADMIN
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ScholarshipStatus {
  DRAFT
  PENDING_REVIEW
  ACTIVE
  CLOSED
}

enum ApplicationStatus {
  PENDING
  UNDER_REVIEW
  SHORTLISTED
  INTERVIEWING
  APPROVED
  REJECTED
}

enum TransactionType {
  DEPOSIT
  DISBURSEMENT
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
}
```

---

## Special Features

### PostgreSQL Full-Text Search

Enabled via `previewFeatures = ["fullTextSearchPostgres"]` in the Prisma schema. Used for scholarship title and description search with `tsquery` syntax.

### JSON Columns

| Column | Model | Purpose |
|--------|-------|---------|
| `criteriaJson` | Scholarship | Eligibility criteria (minCgpa, allowedFields, allowedLocations, genderRequirement) |
| `requirementsJson` | Scholarship | Application requirements |
| `formData` | Application | Dynamic application form data |
| `preferences` | User | User settings (theme, notifications) |
| `featuresJson` | FraudFlag | Fraud detection feature vectors |
| `oldVal` / `newVal` | AuditLog | Before/after change snapshots |

### Cascade Deletes

- `User → Student`: CASCADE
- `User → Provider`: CASCADE
