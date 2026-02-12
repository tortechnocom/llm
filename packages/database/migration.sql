-- Update vector dimension from 768 to 4096
ALTER TABLE knowledge_base 
ALTER COLUMN embedding TYPE vector(4096);
