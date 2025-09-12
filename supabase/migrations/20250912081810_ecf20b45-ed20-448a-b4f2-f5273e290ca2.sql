-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  can_attempt BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('aptitude', 'product_knowledge', 'kra_knowledge')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attempts table
CREATE TABLE public.attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attempt_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  aptitude_score INTEGER NOT NULL DEFAULT 0,
  product_score INTEGER NOT NULL DEFAULT 0,
  kra_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Employees can view their own record" 
ON public.employees 
FOR SELECT 
USING (true);

-- Create policies for questions table (all employees can read questions)
CREATE POLICY "All employees can view questions" 
ON public.questions 
FOR SELECT 
USING (true);

-- Create policies for attempts table
CREATE POLICY "Employees can view their own attempts" 
ON public.attempts 
FOR SELECT 
USING (true);

CREATE POLICY "Employees can create their own attempts" 
ON public.attempts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Employees can update their own attempts" 
ON public.attempts 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_questions_section ON public.questions(section);
CREATE INDEX idx_attempts_employee_id ON public.attempts(employee_id);
CREATE INDEX idx_attempts_attempt_date ON public.attempts(attempt_date);

-- Insert sample questions for testing
INSERT INTO public.questions (section, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
-- Aptitude questions
('aptitude', 'What is 15% of 200?', '25', '30', '35', '40', 'B'),
('aptitude', 'If a train travels 120 km in 2 hours, what is its speed?', '50 km/h', '60 km/h', '70 km/h', '80 km/h', 'B'),
('aptitude', 'Complete the series: 2, 6, 18, 54, ?', '108', '162', '216', '324', 'B'),
('aptitude', 'A man buys a book for $10 and sells it for $12. What is his profit percentage?', '15%', '20%', '25%', '30%', 'B'),
('aptitude', 'If CODING is written as DPEJOH, how is BASIC written?', 'CBTJD', 'CBTJE', 'OBTJD', 'OBTJE', 'A'),
('aptitude', 'What comes next in the sequence: 1, 4, 9, 16, ?', '20', '24', '25', '30', 'C'),
('aptitude', 'A clock shows 3:15. What is the angle between the hour and minute hands?', '0°', '7.5°', '15°', '22.5°', 'B'),
('aptitude', 'If 3x + 5 = 20, what is the value of x?', '3', '4', '5', '6', 'C'),
('aptitude', 'Which number should come next: 100, 96, 92, 88, ?', '82', '84', '86', '90', 'B'),
('aptitude', 'A rectangle has a length of 8 cm and width of 5 cm. What is its area?', '30 cm²', '35 cm²', '40 cm²', '45 cm²', 'C'),
('aptitude', 'What is the next number: 1, 1, 2, 3, 5, 8, ?', '11', '12', '13', '14', 'C'),
('aptitude', 'If today is Wednesday, what day will it be after 100 days?', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'B'),

-- Product Knowledge questions
('product_knowledge', 'What is the main feature of our premium product line?', 'Basic functionality', 'Advanced analytics', 'Simple interface', 'Low cost', 'B'),
('product_knowledge', 'Which product category generates the highest revenue?', 'Category A', 'Category B', 'Category C', 'Category D', 'A'),
('product_knowledge', 'What is our standard warranty period?', '6 months', '1 year', '2 years', '3 years', 'B'),
('product_knowledge', 'Which feature distinguishes us from competitors?', 'Price', 'Innovation', 'Marketing', 'Distribution', 'B'),
('product_knowledge', 'What is the target market for our latest product?', 'Students', 'Professionals', 'Seniors', 'Children', 'B'),
('product_knowledge', 'Which certification does our main product have?', 'ISO 9001', 'ISO 14001', 'ISO 27001', 'ISO 45001', 'A'),
('product_knowledge', 'What is the primary material used in our products?', 'Plastic', 'Metal', 'Glass', 'Composite', 'D'),
('product_knowledge', 'Which region has the highest product adoption?', 'North America', 'Europe', 'Asia', 'South America', 'A'),
('product_knowledge', 'What is our product development cycle?', '3 months', '6 months', '9 months', '12 months', 'D'),
('product_knowledge', 'Which technology platform do we use?', 'Platform A', 'Platform B', 'Platform C', 'Platform D', 'B'),
('product_knowledge', 'What is our customer satisfaction rating?', '85%', '90%', '95%', '98%', 'C'),
('product_knowledge', 'Which product line was launched most recently?', 'Pro Series', 'Max Series', 'Elite Series', 'Prime Series', 'C'),

-- KRA Knowledge questions
('kra_knowledge', 'What does KRA stand for?', 'Key Result Areas', 'Key Responsibility Areas', 'Key Revenue Areas', 'Key Resource Areas', 'B'),
('kra_knowledge', 'How often should KRAs be reviewed?', 'Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'B'),
('kra_knowledge', 'Which is the most important KRA for sales team?', 'Training', 'Revenue targets', 'Team building', 'Documentation', 'B'),
('kra_knowledge', 'What percentage weightage does customer satisfaction have in KRAs?', '20%', '25%', '30%', '35%', 'B'),
('kra_knowledge', 'Which KRA is mandatory for all employees?', 'Innovation', 'Compliance', 'Sales', 'Marketing', 'B'),
('kra_knowledge', 'How many KRAs should an employee typically have?', '3-5', '5-7', '7-9', '9-11', 'A'),
('kra_knowledge', 'What is the primary purpose of KRAs?', 'Punishment', 'Performance measurement', 'Salary determination', 'Promotion criteria', 'B'),
('kra_knowledge', 'Which department sets the KRA framework?', 'IT', 'Finance', 'HR', 'Operations', 'C'),
('kra_knowledge', 'What happens if KRAs are not met?', 'Immediate termination', 'Performance improvement plan', 'Salary cut', 'Demotion', 'B'),
('kra_knowledge', 'Which tool is used for KRA tracking?', 'Excel', 'Performance management system', 'Email', 'Word documents', 'B'),
('kra_knowledge', 'What is the ideal KRA achievement percentage?', '70%', '80%', '90%', '100%', 'C'),
('kra_knowledge', 'Who approves employee KRAs?', 'HR', 'Direct supervisor', 'CEO', 'Team lead', 'B');

-- Insert sample employee for testing
INSERT INTO public.employees (username, password, can_attempt) VALUES
('demo', 'password123', true),
('john_doe', 'pass456', true),
('jane_smith', 'secure789', false);