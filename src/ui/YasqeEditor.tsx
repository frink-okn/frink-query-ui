import { styled } from "@mui/joy";
import Yasqe from "@triply/yasqe";
import { useRef, useEffect } from "react";

interface YasqeEditorProps {
  value: string;
  onChange: (newValue: string, isSyntaxValid: boolean) => void;
}

export function YasqeEditor({ value, onChange }: YasqeEditorProps) {
  const divEl = useRef(null);
  const yasqeInstance = useRef<Yasqe | null>(null);

  useEffect(() => {
    if (!divEl.current) {
      console.error("divEl.current is null in YasqeEditor");
      return;
    }

    yasqeInstance.current = new Yasqe(divEl.current);
    yasqeInstance.current.setValue(value);

    return () => {
      yasqeInstance.current?.destroy();
      yasqeInstance.current = null;
    };
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // `value` is handled by the following useEffect

  useEffect(() => {
    if (yasqeInstance.current && yasqeInstance.current.getValue() !== value) {
      yasqeInstance.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleChange = () => {
      if (yasqeInstance.current) {
        onChange(
          yasqeInstance.current.getValue(),
          yasqeInstance.current.queryValid,
        );
      }
    };

    if (yasqeInstance.current) {
      yasqeInstance.current.on("change", handleChange);
    }

    // 'change' isn't listed by Typescript as an available event. However,
    // we're also `destroy`ing the instance in the unmount function, so I
    // dont think it's necessary to remove the event listener.

    // return () => {
    //   yasqeInstance.current?.off('change', handleChange);
    // };
  }, [onChange]);

  return <StyledDiv ref={divEl} className="editor-wrapper"></StyledDiv>;
}

const StyledDiv = styled("div")`
  flex: 1;
  overflow-y: auto;
`;
