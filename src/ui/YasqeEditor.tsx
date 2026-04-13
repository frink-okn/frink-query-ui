import { styled } from "@mui/joy";
import Yasqe from "@triply/yasqe";
import { useRef, useEffect } from "react";
import { useExplicitQueryContext } from "../context/explicitQuery";

interface YasqeEditorProps {
  initialValue: string;
  onChange: (newValue: string, isSyntaxValid: boolean) => void;
}

export function YasqeEditor({ initialValue, onChange }: YasqeEditorProps) {
  const divEl = useRef(null);
  const yasqeInstance = useRef<Yasqe | null>(null);
  const { explicitQuery } = useExplicitQueryContext()

  useEffect(() => {
    if (!divEl.current) {
      console.error("divEl.current is null in YasqeEditor");
      return;
    }

    yasqeInstance.current = new Yasqe(divEl.current, {
      value: initialValue,
      consumeShareLink: null,
      persistenceId: null,
    });

    // yasqeInstance.current.setValue(initialValue)

    return () => {
      yasqeInstance.current?.destroy();
      yasqeInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (explicitQuery !== null && yasqeInstance.current) {
      yasqeInstance.current.setValue(explicitQuery)
      yasqeInstance.current.refresh()
    }
  }, [explicitQuery])

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
