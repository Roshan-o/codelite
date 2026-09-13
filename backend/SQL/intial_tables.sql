-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- PROBLEMS
-- ============================================

CREATE TABLE problems (
    problem_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    constraints TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT problems_difficulty_check
        CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD'))
);


-- ============================================
-- TAGS
-- ============================================

CREATE TABLE tags (
    tag_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);


-- ============================================
-- PROBLEM_TAG
-- ============================================

CREATE TABLE problem_tags (
    problem_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,

    PRIMARY KEY (problem_id, tag_id),

    CONSTRAINT fk_problem_tags_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(problem_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_problem_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(tag_id)
        ON DELETE CASCADE
);


-- ============================================
-- TEST_CASES
-- ============================================

CREATE TABLE test_cases (
    test_case_id BIGSERIAL PRIMARY KEY,

    problem_id BIGINT NOT NULL,

    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_test_cases_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(problem_id)
        ON DELETE CASCADE
);


-- ============================================
-- SUBMISSIONS
-- ============================================

CREATE TABLE submissions (
    submission_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL,

    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'CPP',
    status VARCHAR(30) NOT NULL,

    execution_time INT,
    memory_used INT,

    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submissions_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_submissions_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(problem_id),

    CONSTRAINT submissions_language_check
        CHECK (language IN ('CPP')),

    CONSTRAINT submissions_status_check
        CHECK (
            status IN (
                'PENDING',
                'RUNNING',
                'ACCEPTED',
                'WRONG_ANSWER',
                'TIME_LIMIT_EXCEEDED',
                'MEMORY_LIMIT_EXCEEDED',
                'RUNTIME_ERROR',
                'COMPILATION_ERROR'
            )
        )
);


-- ============================================
-- SUBMISSION_RESULTS
-- ============================================

CREATE TABLE submission_results (
    submission_id BIGINT NOT NULL,
    test_case_id BIGINT NOT NULL,

    status VARCHAR(30) NOT NULL,
    execution_time INT,
    memory_used INT,
    output TEXT,

    PRIMARY KEY (submission_id, test_case_id),

    CONSTRAINT fk_submission_results_submission
        FOREIGN KEY (submission_id)
        REFERENCES submissions(submission_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submission_results_test_case
        FOREIGN KEY (test_case_id)
        REFERENCES test_cases(test_case_id)
        ON DELETE CASCADE,

    CONSTRAINT submission_results_status_check
        CHECK (
            status IN (
                'PASSED',
                'WRONG_ANSWER',
                'TIME_LIMIT_EXCEEDED',
                'MEMORY_LIMIT_EXCEEDED',
                'RUNTIME_ERROR'
            )
        )
);