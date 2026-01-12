LLM (RAG) Platform
User can create llm agent and public to other user by using system ERC-20 Token, agent creator get token from other user how use the agent then share revenue with platform 


Features
- Input Knowledge base

Tech Stacks
1. LLM-backend
- Backend service: NestJS, Typeorm, 
- Database: PostgreSQL + PGVector
- Ollama tool

2. llm-frontend: NextJS
- HeroUI (https://www.heroui.com/)
- Tailwind

Data Model
1. User
  - id
  - firstname
  - lastname
2. Agents (Table เก็บข้อมูล Agent (Trainer เป็นเจ้าของ))
  - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
  - trainer_id uuid REFERENCES auth.users(id),
  - name varchar(255) NOT NULL,
  - domain varchar(50), -- เช่น 'agriculture', 'physics', 'cooking'
  - system_prompt text,  -- คำสั่งพื้นฐานของ Agent ตัวนี้
  - token_price_multiplier float DEFAULT 1.0, -- ราคาต่อ token (ถ้าเก่งมากก็ตั้งแพงได้)
  - created_at timestamptz DEFAULT now()
3. KnowledgeBase (Table เก็บความรู้ (Knowledge Base) แบบรวมทุกประเภท)
  - id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  - agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  - title text,
   - content text,         -- เนื้อหาที่หั่นเป็น Chunk แล้ว
  - embedding vector(768), -- พิกัดจาก nomic-embed-text หรือ model อื่น
  - metadata jsonb,       -- เก็บข้อมูลเฉพาะทาง เช่น { "temp": "25C", "ingredient": "salt" }
  - tags text[],          -- เช่น ['organic', 'quantum', 'dessert']
  - created_at timestamptz DEFAULT now()
4. TokenTransactions (Table สำหรับระบบ Token Billing (หัวใจของรายได้))
  - id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  - user_id uuid REFERENCES auth.users(id),
  - agent_id uuid REFERENCES agents(id),
  - tokens_used int NOT NULL,
  - amount_deducted decimal(10, 4),
  - transaction_type varchar(20), -- 'usage', 'topup'
  - created_at timestamptz DEFAULT now()
