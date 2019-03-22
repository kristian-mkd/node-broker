interface Consumer {
  url: string;
}

interface Message {
  id: number;
  content: string;
}

interface MessageModel {
  dataValues: Message;
}