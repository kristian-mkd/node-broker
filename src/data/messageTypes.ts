interface Message {
  id: number;
  content: string;
  sender: string;
  created_at: string;
}

interface MessageModel {
  dataValues: Message;
}