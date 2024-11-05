import { MessageContext } from 'contexts/MessageContext';
import { memo, useContext, useEffect, useState } from 'react';

import type { IAction, IMessageElement, IStep } from 'client-types/';

import { Message } from './Message';

interface Props {
  messages: IStep[];
  elements: IMessageElement[];
  actions: IAction[];
  indent: number;
  isRunning?: boolean;
}

const Messages = memo(
  ({ messages, elements, actions, indent, isRunning }: Props) => {
    const messageContext = useContext(MessageContext);
    const [initialMessage, setInitialMessage] = useState<undefined | string>();
    useEffect(() => {
      // THIS IS JUST AWFUL.
      // The initial message we tried sending in on_chat_start sometimes does not
      // get sent - no socket message shows up in network activity.
      // So here we are, literally injecting the welcome message straight into
      // the chainlit front end.
      // Yuk!
      // I've spent hours trying to fix the issue with sending a message on on_chat_start
      // and it just isn't worth it. So here we are. Enjoy this mess!
      const initialMessages = [
        `Hi there! I hope you're doing well. I'm here to assist you with learning techniques. Can you tell me about the exam you are preparing for?`,
        `Hello! I trust all is well with you. I'm available to help you with learning methods. Can you tell me about the exam you are preparing for?`,
        `Greetings! I hope you're having a great day. I'm here to support you with learning strategies. Can you tell me about the exam you are preparing for?`,
        `Hey! I hope everything is going smoothly for you. I'm ready to assist you with learning techniques. Can you tell me about the exam you are preparing for?`,
        `Hi! I hope you're having a good day. I'm here to help with learning techniques. Can you tell me about the exam you are preparing for?`,
        `Hello! I hope all is well with you. I'm here to assist you in learning techniques. Can you tell me about the exam you are preparing for?`,
        `Hi! I hope you're doing great. I'm available to help you with learning techniques. Can you tell me about the exam you are preparing for?`,
        `Greetings! I hope you're well. I'm here to support your learning process. Can you tell me about the exam you are preparing for?`,
        `Hello! I trust you're doing fine. I'm ready to assist you with learning methods. Can you tell me about the exam you are preparing for?`,
        `Hey there! I hope everything is going well. I'm here to help you with learning techniques. Can you tell me about the exam you are preparing for?`
      ];
      setInitialMessage(
        initialMessages[Math.floor(Math.random() * initialMessages.length)]
      );
    }, []);

    const isRoot = indent === 0;
    let previousAuthor = '';

    const filtered = messages.filter((m, i) => {
      const content = m.output;
      const hasContent = !!content;
      const hasInlinedElement = elements.find(
        (el) => el.display === 'inline' && el.forId === m.id
      );
      const hasChildren = !!m.steps?.length && !messageContext.hideCot;
      const isLast = i === messages.length - 1;
      const messageRunning =
        isRunning === undefined
          ? messageContext.loading && isLast
          : isRunning && isLast;
      return (
        hasContent ||
        hasInlinedElement ||
        hasChildren ||
        (!hasContent && messageRunning)
      );
    });

    filtered.unshift({
      id: '0',
      threadId: '0',
      createdAt: new Date().toISOString(),
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      output: initialMessage ?? '',
      name: 'Mentor',
      type: 'assistant_message',
      language: '',
      streaming: false,
      disableFeedback: false,
      isError: false,
      waitForAnswer: false,
      indent: 0,
      generation: undefined
    });

    return (
      <>
        {filtered.map((m, i) => {
          const author = m.name;
          const isLast = filtered.length - 1 === i;
          let messageRunning =
            isRunning === undefined ? messageContext.loading : isRunning;
          if (isRoot) {
            messageRunning = messageRunning && isLast;
          }
          const showAvatar = author !== previousAuthor;
          const showBorder = false;
          previousAuthor = author;
          return (
            <Message
              message={m}
              elements={elements}
              actions={actions}
              showAvatar={showAvatar}
              showBorder={showBorder}
              key={m.id}
              indent={indent}
              isRunning={messageRunning}
              isLast={isLast}
            />
          );
        })}
      </>
    );
  }
);

export { Messages };
