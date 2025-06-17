-- Insert sample users
INSERT INTO users (id, name, email, role, avatar) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john@example.com', 'product-owner', '/placeholder.svg?height=32&width=32'),
('550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', 'jane@example.com', 'scrum-master', '/placeholder.svg?height=32&width=32'),
('550e8400-e29b-41d4-a716-446655440003', 'Mike Johnson', 'mike@example.com', 'developer', '/placeholder.svg?height=32&width=32'),
('550e8400-e29b-41d4-a716-446655440004', 'Sarah Wilson', 'sarah@example.com', 'designer', '/placeholder.svg?height=32&width=32'),
('550e8400-e29b-41d4-a716-446655440005', 'Tom Brown', 'tom@example.com', 'qa', '/placeholder.svg?height=32&width=32');

-- Insert sample product
INSERT INTO products (id, name, description, version) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'E-Commerce Platform', 'A comprehensive e-commerce solution', '1.0.0');

-- Insert sample feature
INSERT INTO features (id, name, description, priority, product_id, assigned_user_id) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Authentication System', 'Handles user authentication and authorization', 9, '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample epic
INSERT INTO epics (id, title, description, status, priority, feature_id, assigned_user_id) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'User Management', 'Complete user authentication and profile management system', 'planning', 8, '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample user story
INSERT INTO user_stories (id, title, description, acceptance_criteria, story_points, priority, status, sprint_status, epic_id, assigned_user_id) VALUES
('550e8400-e29b-41d4-a716-446655440040', 'User Login', 'As a user, I want to log in to access my account', '["User can enter email and password", "System validates credentials", "User is redirected to dashboard on success"]', 5, 9, 'backlog', 'backlog', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample tasks
INSERT INTO tasks (id, title, description, status, priority, estimated_hours, sprint_status, user_story_id, assigned_user_id) VALUES
('550e8400-e29b-41d4-a716-446655440050', 'Implement user authentication', 'Set up login and registration functionality', 'todo', 8, 8, 'backlog', '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440051', 'Create login form UI', 'Design and implement the login form interface', 'todo', 6, 4, 'backlog', '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440004');

-- Insert sample sprint
INSERT INTO sprints (id, name, start_date, end_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440060', 'Sprint 1', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 'planning');
