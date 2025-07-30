"use client";

import React from "react";
import Select, {
  components,
  OptionProps,
  SingleValueProps,
} from "react-select";
import {
  useSubredditSearch,
  SubredditOption,
} from "@/hooks/useSubredditSearch";

interface SubredditAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Custom option component to show subreddit details
const CustomOption = (props: OptionProps<SubredditOption>) => {
  const { data } = props;

  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {data.icon_img && (
            <img
              src={data.icon_img}
              alt={data.label}
              className="w-6 h-6 rounded-full"
            />
          )}
          <div>
            <div className="font-medium">{data.label}</div>
            {data.public_description && (
              <div className="text-sm text-gray-500 truncate max-w-md">
                {data.public_description}
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {data.subscribers.toLocaleString()} members
        </div>
      </div>
    </components.Option>
  );
};

// Custom single value component
const CustomSingleValue = (props: SingleValueProps<SubredditOption>) => {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        {data.icon_img && (
          <img
            src={data.icon_img}
            alt={data.label}
            className="w-5 h-5 rounded-full"
          />
        )}
        <span>{data.label}</span>
      </div>
    </components.SingleValue>
  );
};

export function SubredditAutocomplete({
  value,
  onChange,
  placeholder = "Search for a subreddit...",
  className = "",
}: SubredditAutocompleteProps) {
  const { options, isLoading, searchSubreddits } = useSubredditSearch();

  // Find the current value in options or create a default option
  const currentValue = value
    ? {
        value: value,
        label: `r/${value}`,
        subscribers: 0,
      }
    : null;

  const customStyles = {
    control: (base: React.CSSProperties) => ({
      ...base,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.3)",
      color: "white",
      "&:hover": {
        borderColor: "white",
      },
    }),
    input: (base: React.CSSProperties) => ({
      ...base,
      color: "white",
    }),
    placeholder: (base: React.CSSProperties) => ({
      ...base,
      color: "rgba(233, 213, 255, 0.8)",
    }),
    singleValue: (base: React.CSSProperties) => ({
      ...base,
      color: "white",
    }),
    menu: (base: React.CSSProperties) => ({
      ...base,
      backgroundColor: "rgba(75, 0, 130, 0.95)",
      backdropFilter: "blur(10px)",
      zIndex: 9999,
    }),
    menuPortal: (base: React.CSSProperties) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base: React.CSSProperties, state: { isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "rgba(255, 255, 255, 0.1)"
        : "transparent",
      color: "white",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    }),
    loadingIndicator: (base: React.CSSProperties) => ({
      ...base,
      color: "white",
    }),
    noOptionsMessage: (base: React.CSSProperties) => ({
      ...base,
      color: "rgba(255, 255, 255, 0.7)",
    }),
  };

  return (
    <Select<SubredditOption>
      value={currentValue}
      onChange={(option) => onChange(option?.value || "")}
      onInputChange={(inputValue) => searchSubreddits(inputValue)}
      options={options}
      isLoading={isLoading}
      placeholder={placeholder}
      className={className}
      classNamePrefix="subreddit-select"
      components={{
        Option: CustomOption,
        SingleValue: CustomSingleValue,
      }}
      styles={customStyles}
      isClearable
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="absolute"
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 2
          ? "Type at least 2 characters to search"
          : "No subreddits found"
      }
    />
  );
}
