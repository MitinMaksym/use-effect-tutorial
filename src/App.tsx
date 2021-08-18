import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

type SearchResult = {
  items: UserType[];
};
type UserType = {
  login: string;
};
type UserDetails = {
  id: number;
  avatar_url: string;
};

type HeaderPropsType = {
  term: string;
  onSearchTermChange: (serchTerm: string) => void;
};
type UserListPropsType = {
  term: string;
  selectedUser: UserType | null;
  onUserSelect: (user: UserType) => void;
};
type UserDetailsPropsType = {
  user: UserType | null;
  timerSeconds: number;
};

type TimerPropsType = {
  seconds: number;
  setTimerSeconds: () => void;
};

const UserList = (props: UserListPropsType) => {
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    axios
      .get<SearchResult>(`https://api.github.com/search/users?q=${props.term}`)
      .then((data) => setUsers(data.data.items));
  }, [props.term]);

  return (
    <div className='user-list'>
      <ul>
        {users.map((user) => (
          <li
            key={user.login}
            className={
              user.login === props.selectedUser?.login ? "selected" : ""
            }
            onClick={() => props.onUserSelect(user)}
          >
            {user.login}
          </li>
        ))}
      </ul>
    </div>
  );
};

const UserDetails = (props: UserDetailsPropsType) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(props.timerSeconds);

  const setTimerSecondsHandler = () => {
    setTimerSeconds((prev) => prev - 1);
  };

  useEffect(() => {
    if (timerSeconds < 1) {
      setUserDetails(null);
      setTimerSeconds(props.timerSeconds);
    }
  }, [timerSeconds]);
  useEffect(() => {
    axios
      .get<UserDetails>(`https://api.github.com/users/${props.user?.login}`)
      .then((res) => {
        setUserDetails(res.data);
      });
    setTimerSeconds(props.timerSeconds);
  }, [props.user]);

  return (
    userDetails && (
      <div className='user-details'>
        <Timer
          seconds={timerSeconds}
          setTimerSeconds={setTimerSecondsHandler}
        />
        <h1>{props.user?.login}</h1>
        <div>
          <img src={userDetails.avatar_url} alt='Avatar' />
        </div>
      </div>
    )
  );
};

const Header = (props: HeaderPropsType) => {
  const [tempTerm, setTempTerm] = useState(props.term);
  return (
    <div className='header'>
      <input
        type='text'
        name='search-input'
        id='search'
        value={tempTerm}
        onChange={(e) => setTempTerm(e.target.value)}
      />
      <button onClick={() => props.onSearchTermChange(tempTerm)}>Find</button>
    </div>
  );
};

const Timer = (props: TimerPropsType) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      props.setTimerSeconds();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [props.seconds]);

  return <div>{props.seconds}</div>;
};

function Github() {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("bro");

  return (
    <div className='app'>
      <Header
        term={currentSearchTerm}
        onSearchTermChange={setCurrentSearchTerm}
      />
      <div className='main'>
        <UserList
          term={currentSearchTerm}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
        />
        {<UserDetails user={selectedUser} timerSeconds={3} />}
      </div>
    </div>
  );
}

export default Github;
