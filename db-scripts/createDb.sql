CREATE TABLE messages (
  ID          SERIAL        PRIMARY KEY,
  content     VARCHAR(4096) NOT NULL,
  sender      VARCHAR(256)  NOT NULL,
  created_at  TIMESTAMP
);