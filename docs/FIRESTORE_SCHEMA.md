# Firestore Schema (Extended)

## Existing collections

- `profiles/{uid}`
  - `name`, `email`, `targetExam`, `grade`, `role`, `createdAt`, `updatedAt`
- `progress/{uid}`
  - `readinessScore`, `streakDays`, `completedTasks`, `lastActiveAt`
- `activities/{activityId}`
  - `userId`, `day`, `hours`, `topic`, `category`, `createdAt`
- `tasks/{taskId}`
  - `userId`, `title`, `status`, `completed`, `scope`, `sourceTaskId`, `createdAt`, `updatedAt`
- `messages/{messageId}`
  - `userId`, `text`, `from`, `createdAt`

## New collections

- `questionBank/{questionId}` (optional seed, currently local constant with 50 questions)
  - `questionId`, `category`, `difficulty`, `question`, `options[]`, `correctAnswer`

- `tests/{testId}`
  - `title`
  - `createdBy`
  - `categories[]` (`aptitude`, `technical`, `reasoning`, `verbal`)
  - `assignedTo[]` (contains `__all_students__` or student UIDs)
  - `deadline` (millis/timestamp)
  - `difficulty`
  - `questionIds[]`
  - `createdAt`

- `testResults/{resultId}`
  - `uid`
  - `testId`
  - `answers[]` (`questionId`, `selectedAnswer`, `correctAnswer`, `isCorrect`, `category`)
  - `score`
  - `categoryWiseScore` (object)
  - `timeTaken`
  - `submittedAt`

- `aiReports/{reportId}`
  - `uid`
  - `testId`
  - `strengths[]`
  - `weaknesses[]`
  - `improvementPlan[]`
  - `weakestCategory`
  - `generatedAt`

- `weeklyGoals/{goalId}`
  - `uid` (student uid or `__all_students__`)
  - `title`
  - `target`
  - `achieved`
  - `weekStart`
  - `autoAdjust`
  - `createdAt`

- `mockInterviews/{mockId}`
  - `uid`
  - `interviewDate`
  - `feedbackScore`
  - `weakAreas[]`
  - `notes`
  - `createdAt`

- `notifications/{notificationId}`
  - `userId`
  - `title`
  - `message`
  - `type` (`info`, `alert`, `reminder`, `insight`)
  - `read`
  - `createdAt`

## Recommended composite indexes

- `tests`: `assignedTo array-contains` + `createdAt desc`
- `testResults`: `uid ==` + `submittedAt desc`
- `aiReports`: `uid ==` + `generatedAt desc`
- `weeklyGoals`: `uid ==` + `createdAt desc`
- `mockInterviews`: `uid ==` + `createdAt desc`
- `notifications`: `userId ==` + `createdAt desc`
