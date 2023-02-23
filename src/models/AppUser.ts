export default interface AppUser {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    contact_no: string;
    avatar_url: string | null;
    team_id: string;
}
