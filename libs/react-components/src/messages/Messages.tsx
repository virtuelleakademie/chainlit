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
        `Hallo, ich hoffe, es geht dir gut! Ich bin der \
Chatbot, der dir beim Reflektieren hilft.Was war das \
Thema deiner letzten Veranstaltung, über das du gerne \
sprechen möchtest ? `,
        `Hallo, ich wünsche dir einen schönen Tag! Ich bin der \
Chatbot, der dich beim Nachdenken unterstützt.Welches \
war das Thema deiner letzten Veranstaltung, über das du \
gerne diskutieren möchtest ? `,
        `Guten Tag, ich hoffe, du fühlst dich wohl! Ich bin \
der Chatbot, der dir bei der Reflexion zur Seite steht. \
Über welches Thema deiner letzten Veranstaltung möchtest \
du sprechen ? `,
        `Hallo, ich hoffe, alles ist bei dir in Ordnung! Ich \
bin der Chatbot, der dir beim Überlegen hilft.Welches \
Thema deiner letzten Veranstaltung möchtest du gerne \
erörtern ? `,
        `Hallo, ich hoffe, du bist wohlauf! Ich bin der \
Chatbot, der dir bei deinen Überlegungen assistiert.Was \
war das Thema deiner letzten Veranstaltung, über das du \
gerne reden möchtest ? `,
        `Guten Tag, ich hoffe, es geht dir gut! Ich \
bin der Chatbot, der dir bei der Reflexion behilflich \
ist.Über welches Thema deiner letzten Veranstaltung \
würdest du gerne sprechen ? `
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
      name: 'Chatbot',
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
